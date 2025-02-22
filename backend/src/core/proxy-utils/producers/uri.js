/* eslint-disable no-case-declarations */
import { Base64 } from 'js-base64';

export default function URI_Producer() {
    const type = 'SINGLE';
    const produce = (proxy) => {
        let result = '';
        switch (proxy.type) {
            case 'ss':
                const userinfo = `${proxy.cipher}:${proxy.password}`;
                result = `ss://${Base64.encode(userinfo)}@${proxy.server}:${
                    proxy.port
                }/`;
                if (proxy.plugin) {
                    result += '?plugin=';
                    const opts = proxy['plugin-opts'];
                    switch (proxy.plugin) {
                        case 'obfs':
                            result += encodeURIComponent(
                                `simple-obfs;obfs=${opts.mode}${
                                    opts.host ? ';obfs-host=' + opts.host : ''
                                }`,
                            );
                            break;
                        case 'v2ray-plugin':
                            result += encodeURIComponent(
                                `v2ray-plugin;obfs=${opts.mode}${
                                    opts.host ? ';obfs-host' + opts.host : ''
                                }${opts.tls ? ';tls' : ''}`,
                            );
                            break;
                        default:
                            throw new Error(
                                `Unsupported plugin option: ${proxy.plugin}`,
                            );
                    }
                }
                result += `#${encodeURIComponent(proxy.name)}`;
                break;
            case 'ssr':
                result = `${proxy.server}:${proxy.port}:${proxy.protocol}:${
                    proxy.cipher
                }:${proxy.obfs}:${Base64.encode(proxy.password)}/`;
                result += `?remarks=${Base64.encode(proxy.name)}${
                    proxy['obfs-param']
                        ? '&obfsparam=' + Base64.encode(proxy['obfs-param'])
                        : ''
                }${
                    proxy['protocol-param']
                        ? '&protocolparam=' +
                          Base64.encode(proxy['protocol-param'])
                        : ''
                }`;
                result = 'ssr://' + Base64.encode(result);
                break;
            case 'vmess':
                // V2RayN URI format
                result = {
                    ps: proxy.name,
                    add: proxy.server,
                    port: proxy.port,
                    id: proxy.uuid,
                    type: '',
                    aid: 0,
                    net: proxy.network || 'tcp',
                    tls: proxy.tls ? 'tls' : '',
                };
                if (proxy.tls && proxy.sni) {
                    result.sni = proxy.sni;
                }
                // obfs
                if (proxy.network === 'ws') {
                    result.path = proxy['ws-opts'].path || '/';
                    if (proxy['ws-opts'].headers.Host) {
                        result.host = proxy['ws-opts'].headers.Host;
                    }
                }
                result = 'vmess://' + Base64.encode(JSON.stringify(result));
                break;
            case 'trojan':
                let transport = '';
                if (proxy.network) {
                    transport = `&type=${proxy.network}`;
                    let transportPath = proxy[`${proxy.network}-opts`]?.path;
                    let transportHost =
                        proxy[`${proxy.network}-opts`]?.headers?.Host;
                    if (transportPath) {
                        transport += `&path=${encodeURIComponent(
                            Array.isArray(transportPath)
                                ? transportPath[0]
                                : transportPath,
                        )}`;
                    }
                    if (transportHost) {
                        transport += `&host=${encodeURIComponent(
                            Array.isArray(transportHost)
                                ? transportHost[0]
                                : transportHost,
                        )}`;
                    }
                }
                result = `trojan://${proxy.password}@${proxy.server}:${
                    proxy.port
                }?sni=${encodeURIComponent(proxy.sni || proxy.server)}${
                    proxy['skip-cert-verify'] ? '&allowInsecure=1' : ''
                }${transport}#${encodeURIComponent(proxy.name)}`;
                break;
        }
        return result;
    };
    return { type, produce };
}
