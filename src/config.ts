const botInviteUrl =
  'https://discord.com/api/oauth2/authorize?client_id=749282568733458545&permissions=536890432&scope=bot%20applications.commands';

const colours: { confirm: number; warn: number; gray: number } = {
  confirm: 0x0c4880,
  warn: 0xff0000,
  gray: 0x2f3136,
};

const owners: string[] = ['123456789'];

const schemaVersion = 1;

const supportServerUrl = '';

const webhookDefaults: { name: string; avatar: string } = {
  name: 'Impersonator Webhook',
  avatar: '',
};

const welcomeDefaults: string[] = ['Hello!'];

export default {
  botInviteUrl,
  colours,
  owners,
  schemaVersion,
  supportServerUrl,
  webhookDefaults,
  welcomeDefaults,
};
