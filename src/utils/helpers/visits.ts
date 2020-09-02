import bowser from 'bowser';
import { zipObj } from 'ramda';
import { Empty, hasValue } from '../utils';
import { Stats, UserAgent } from '../../visits/types';

const DEFAULT = 'Others';
const BROWSERS_WHITELIST = [
  'Android Browser',
  'Chrome',
  'Chromium',
  'Firefox',
  'Internet Explorer',
  'Microsoft Edge',
  'Opera',
  'Safari',
  'Samsung Internet for Android',
  'Vivaldi',
  'WeChat',
];

export const parseUserAgent = (userAgent: string | Empty): UserAgent => {
  if (!hasValue(userAgent)) {
    return { browser: DEFAULT, os: DEFAULT };
  }

  const { browser: { name: browser }, os: { name: os } } = bowser.parse(userAgent);

  return { os: os ?? DEFAULT, browser: browser && BROWSERS_WHITELIST.includes(browser) ? browser : DEFAULT };
};

export const extractDomain = (url: string | Empty): string => {
  if (!hasValue(url)) {
    return 'Direct';
  }

  const domain = url.includes('://') ? url.split('/')[2] : url.split('/')[0];

  return domain.split(':')[0];
};

export const fillTheGaps = (stats: Stats, labels: string[]): number[] =>
  Object.values({ ...zipObj(labels, labels.map(() => 0)), ...stats });
