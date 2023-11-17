const operatingSystemIdentifiers = [
  'Windows NT 10.0; Win64; x64',
  'Windows NT 6.3; Win64; x64',
  'Windows NT 6.2; Win64; x64',
  'Windows NT 6.1; Win64; x64',
  'Windows NT 10.0; WOW64',
  'Macintosh; Intel Mac OS X 10_14_5',
  'Macintosh; Intel Mac OS X 10_14_4',
  'Macintosh; Intel Mac OS X 10_13_6'
];
const chromeVersionIdentifiers = [
  '74.0.3729.169',
  '72.0.3626.121',
  '70.0.3538.102',
  '60.0.3112.90'
];

function getRandomOperatingSystem() {
  return operatingSystemIdentifiers[
    Math.floor(Math.random() * operatingSystemIdentifiers.length)
  ];
}

function getRandomChromeVersion() {
  return chromeVersionIdentifiers[
    Math.floor(Math.random() * chromeVersionIdentifiers.length)
  ];
}

export default function getRandomUserAgent() {
  return `Mozilla/5.0 (${getRandomOperatingSystem()}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${getRandomChromeVersion()} Safari/537.36`;
}
