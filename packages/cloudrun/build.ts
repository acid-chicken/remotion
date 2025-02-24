import {bundleInstaller} from './src/admin/bundle-installer';
import {bundleRenderLogic} from './src/admin/bundle-renderLogic';

const permissions = Bun.file('src/shared/sa-permissions.json');
await Bun.write('dist/shared/sa-permissions.json', permissions);

await bundleRenderLogic();
await bundleInstaller();
