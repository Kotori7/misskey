import * as Koa from 'koa';
import config from '../../config';
import { createHmac } from 'crypto';
import { createTemp } from '../../misc/create-temp';
import { downloadUrl } from '../../misc/download-url';
import { detectType } from '../../misc/get-file-info';
import { readFileSync } from 'fs';
import { serverLogger } from '..';
import { URL } from 'url';
import { toPuny } from '../../misc/convert-host';
import { IImage, convertToPng, convertToJpeg } from '../../services/drive/image-processor';

export async function proxyMedia(ctx: Koa.Context) {
	const [path, cleanup] = await createTemp();
	const url = Buffer.from(ctx.params.url, 'base64').toString('utf-8');

	try {
		if (ctx.params.sig !== generateSignature(url)) throw 403;

		await downloadUrl(url, path);

		const { mime, ext } = await detectType(path);
		if (!mime.startsWith('image/')) throw 403;

		let image : IImage;
		if ('static' in ctx.query && ['image/png', 'image/gif', 'image/apng', 'image/vnd.mozilla.apng'].includes(mime)) {
			image = await convertToPng(path, 498, 280);
		} else if ('preview' in ctx.query && ['image/jpeg', 'image/png', 'image/gif', 'image/apng', 'image/vnd.mozilla.apng'].includes(mime)) {
			image = await convertToJpeg(path, 200, 200);
		} else {
			image = {
				data: readFileSync(path),
				ext,
				type: mime,
			};
		}

		ctx.set('Content-Type', image.type);
		ctx.set('Cache-Control', 'max-age=31536000, immutable');
		ctx.body = image.data;
	} catch(e) {
		serverLogger.error(e);

		if (typeof e == 'number' && e >= 400 && e < 500) {
			ctx.status = e;
		} else {
			ctx.status = 500;
		}
	} finally {
		cleanup();
	}
}

export function getProxyUrl(url: string): string {
	//const u = new URL(url);
	//if (toPuny(u.host) === toPuny(config.host)) return url;
	const sig = generateSignature(url);
	const url64 = Buffer.from(url, 'utf-8').toString('base64').replace(/=+/g, '');
	return `${config.url}/proxy/${url64}/${sig}`;
}

export function getProxyUrlWithPreview(url: string): string {
	//const u = new URL(url);
	//if (toPuny(u.host) === toPuny(config.host)) return url;
	const sig = generateSignature(url);
	const url64 = Buffer.from(url, 'utf-8').toString('base64').replace(/=+/g, '');
	return `${config.url}/proxy/${url64}/${sig}/preview.jpg?preview=1`;
}

export function getProxyUrlStatic(url: string) {
	//const u = new URL(url);
	//if (toPuny(u.host) === toPuny(config.host)) return url;
	const sig = generateSignature(url);
	const url64 = Buffer.from(url, 'utf-8').toString('base64').replace(/=+/g, '');
	return `${config.url}/proxy/${url64}/${sig}/static.png?static=1`;
}

function generateSignature(url: string): string {
	const hmac = createHmac('sha256', config.mediaProxyToken);
	hmac.update(url);
	return hmac.digest('hex');
}
