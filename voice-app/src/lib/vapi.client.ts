import VapiDefault from '@vapi-ai/web';

const Vapi = (VapiDefault as unknown) as new (token: string) => any;

let _vapi: InstanceType<typeof Vapi> | null = null;

export function getVapi() {
  if (!_vapi) {
    _vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
  }
  return _vapi;
}
