import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { buildSrc, upload } from '@imagekit/javascript';
import { firstValueFrom } from 'rxjs';
import { IKAuth } from '../models/imageKit.model';
import { environment } from '../../../environments/env';

@Service()
export class ImagekitService {
  private _http: HttpClient = inject(HttpClient);
  private urlEndpoint = environment.urlEndpoint;
  getUrl(path: string, width?: number, height?: number): string {
    return buildSrc({
      urlEndpoint: this.urlEndpoint,
      src: path,
      transformation: width || height ? [{ width, height }] : [],
    });
  }

  // upload: send a file to ImageKit and return its URL
  async uploadImage(file: File): Promise<string> {
    // 1. ask your server for signed upload parameters
    const auth = await firstValueFrom(
      this._http.get<IKAuth>('http://localhost:3000/imagekit/auth'),
    );
    const res = await upload({
      file,
      fileName: file.name,
      folder: '/products',
      publicKey: auth.publicKey,
      signature: auth.signature,
      expire: auth.expire,
      token: auth.token,
    });
    return res.url ?? '';
  }
}
