import 'whatwg-fetch';
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { BroadcastChannel } from 'broadcast-channel';
import { TransformStream } from 'stream/web';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.BroadcastChannel = BroadcastChannel;
global.TransformStream = TransformStream;
