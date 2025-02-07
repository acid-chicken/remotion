import {MINIMUM_FRAMES_PER_LAMBDA} from '@remotion/lambda-client/constants';
import React from 'react';

export const MinimumFramesPerLambda: React.FC = () => {
	return <code>{MINIMUM_FRAMES_PER_LAMBDA}</code>;
};
