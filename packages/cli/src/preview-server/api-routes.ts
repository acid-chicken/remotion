import type {ApiHandler, ApiRoutes} from './api-types';
import {handleAddRender} from './routes/add-render';
import {canUpdateDefaultPropsHandler} from './routes/can-update-default-props';
import {handleCancelRender} from './routes/cancel-render';
import {handleOpenInFileExplorer} from './routes/open-in-file-explorer';
import {handleRemoveRender} from './routes/remove-render';
import {subscribeToFileExistence} from './routes/subscribe-to-file-existence';
import {unsubscribeFromFileExistence} from './routes/unsubscribe-from-file-existence';
import {updateDefaultPropsHandler} from './routes/update-default-props';

export const allApiRoutes: {
	[key in keyof ApiRoutes]: ApiHandler<
		ApiRoutes[key]['Request'],
		ApiRoutes[key]['Response']
	>;
} = {
	'/api/cancel': handleCancelRender,
	'/api/render': handleAddRender,
	'/api/unsubscribe-from-file-existence': unsubscribeFromFileExistence,
	'/api/subscribe-to-file-existence': subscribeToFileExistence,
	'/api/remove-render': handleRemoveRender,
	'/api/open-in-file-explorer': handleOpenInFileExplorer,
	'/api/update-default-props': updateDefaultPropsHandler,
	'/api/can-update-default-props': canUpdateDefaultPropsHandler,
};
