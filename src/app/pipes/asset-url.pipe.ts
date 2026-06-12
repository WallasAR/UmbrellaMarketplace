import { Pipe, PipeTransform } from '@angular/core';
import { resolveAssetUrl } from '../utils/asset-url';

@Pipe({
  name: 'assetUrl',
  standalone: false
})
export class AssetUrlPipe implements PipeTransform {
  transform(value?: string | null): string {
    return resolveAssetUrl(value);
  }
}
