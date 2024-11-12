var axios = require('axios');
var qs = require('qs');

function TDEncrypt(l) {
  l = JSON.stringify(l);
  l = encodeURIComponent(l);
  var k = '',
    f = 0;
  do {
    var h = l.charCodeAt(f++);
    var d = l.charCodeAt(f++);
    var a = l.charCodeAt(f++);
    var b = h >> 2;
    h = ((h & 3) << 4) | (d >> 4);
    var e = ((d & 15) << 2) | (a >> 6);
    var c = a & 63;
    isNaN(d) ? (e = c = 64) : isNaN(a) && (c = 64);
    k =
      k +
      '23IL<N01c7KvwZO56RSTAfghiFyzWJqVabGH4PQdopUrsCuX*xeBjkltDEmn89.-'.charAt(b) +
      '23IL<N01c7KvwZO56RSTAfghiFyzWJqVabGH4PQdopUrsCuX*xeBjkltDEmn89.-'.charAt(h) +
      '23IL<N01c7KvwZO56RSTAfghiFyzWJqVabGH4PQdopUrsCuX*xeBjkltDEmn89.-'.charAt(e) +
      '23IL<N01c7KvwZO56RSTAfghiFyzWJqVabGH4PQdopUrsCuX*xeBjkltDEmn89.-'.charAt(c);
  } while (f < l.length);
  return k + '/';
}

function getAppVersionFromUserAgent(userAgent) {
  const mozillaIndex = userAgent.indexOf('Mozilla/');
  if (mozillaIndex !== -1) {
    return userAgent.substring(mozillaIndex + 8);
  }
  return userAgent;
}

function getCurrentPageUrl(inputUrl) {
  let l = inputUrl.startsWith('https:') ? 'https://' : 'http://';
  let d = '';

  try {
    const queryIndex = inputUrl.indexOf('?');
    if (queryIndex > 0) {
      inputUrl = inputUrl.substring(0, queryIndex);
    }

    d = inputUrl.substring(l.length);
  } catch (error) {
    console.error('Error parsing URL:', error);
  }

  return d;
}

async function getJsToken(
  userAgent = 'jdapp;android;11.2.8;;;Mozilla/5.0 (Linux; Android 10; ONEPLUS A5010 Build/QKQ1.191014.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/76.0.3809.89 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36',
  url = 'https://plus.m.jd.com/',
  bizId = 'JD-PLUS',
) {
  const d = TDEncrypt({
    ts: { deviceTime: Date.now(), deviceEndTime: Date.now() + 10 },
    ca: {
      tdHash: '5b7096a993d442aef38ceb90cce4b485',
      contextName: 'webgl,experimental-webgl',
      webglversion: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)',
      shadingLV: 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)',
      vendor: 'WebKit',
      renderer: 'WebKit WebGL',
      extensions: [
        'ANGLE_instanced_arrays',
        'EXT_blend_minmax',
        'EXT_clip_control',
        'EXT_color_buffer_half_float',
        'EXT_depth_clamp',
        'EXT_disjoint_timer_query',
        'EXT_float_blend',
        'EXT_frag_depth',
        'EXT_polygon_offset_clamp',
        'EXT_shader_texture_lod',
        'EXT_texture_compression_bptc',
        'EXT_texture_compression_rgtc',
        'EXT_texture_filter_anisotropic',
        'EXT_texture_mirror_clamp_to_edge',
        'EXT_sRGB',
        'KHR_parallel_shader_compile',
        'OES_element_index_uint',
        'OES_fbo_render_mipmap',
        'OES_standard_derivatives',
        'OES_texture_float',
        'OES_texture_float_linear',
        'OES_texture_half_float',
        'OES_texture_half_float_linear',
        'OES_vertex_array_object',
        'WEBGL_blend_func_extended',
        'WEBGL_color_buffer_float',
        'WEBGL_compressed_texture_s3tc',
        'WEBGL_compressed_texture_s3tc_srgb',
        'WEBGL_debug_renderer_info',
        'WEBGL_debug_shaders',
        'WEBGL_depth_texture',
        'WEBGL_draw_buffers',
        'WEBGL_lose_context',
        'WEBGL_multi_draw',
        'WEBGL_polygon_mode',
      ],
      wuv: 'Google Inc. (Intel)',
      wur: 'ANGLE (Intel, Intel(R) UHD Graphics 730 (0x00004C8B) Direct3D11 vs_5_0 ps_5_0, D3D11)',
    },
    m: { compatMode: 'CSS1Compat' },
    n: {
      vendorSub: '',
      productSub: '20030107',
      vendor: 'Google Inc.',
      maxTouchPoints: 1,
      pdfViewerEnabled: false,
      hardwareConcurrency: 12,
      cookieEnabled: true,
      appCodeName: 'Mozilla',
      appName: 'Netscape',
      appVersion: getAppVersionFromUserAgent(userAgent),
      platform: 'Win32',
      product: 'Gecko',
      userAgent: userAgent,
      language: 'zh-CN',
      onLine: true,
      webdriver: false,
      javaEnabled: false,
      deprecatedRunAdAuctionEnforcesKAnonymity: true,
      deviceMemory: 8,
      enumerationOrder: [
        'vendorSub',
        'productSub',
        'vendor',
        'maxTouchPoints',
        'scheduling',
        'userActivation',
        'doNotTrack',
        'geolocation',
        'connection',
        'plugins',
        'mimeTypes',
        'pdfViewerEnabled',
        'webkitTemporaryStorage',
        'webkitPersistentStorage',
        'windowControlsOverlay',
        'hardwareConcurrency',
        'cookieEnabled',
        'appCodeName',
        'appName',
        'appVersion',
        'platform',
        'product',
        'userAgent',
        'language',
        'languages',
        'onLine',
        'webdriver',
        'getGamepads',
        'javaEnabled',
        'sendBeacon',
        'vibrate',
        'deprecatedRunAdAuctionEnforcesKAnonymity',
        'protectedAudience',
        'bluetooth',
        'storageBuckets',
        'clipboard',
        'credentials',
        'keyboard',
        'managed',
        'mediaDevices',
        'storage',
        'serviceWorker',
        'virtualKeyboard',
        'wakeLock',
        'deviceMemory',
        'userAgentData',
        'login',
        'ink',
        'mediaCapabilities',
        'hid',
        'locks',
        'gpu',
        'mediaSession',
        'permissions',
        'presentation',
        'usb',
        'xr',
        'serial',
        'adAuctionComponents',
        'runAdAuction',
        'canLoadAdAuctionFencedFrame',
        'canShare',
        'share',
        'clearAppBadge',
        'getBattery',
        'getUserMedia',
        'requestMIDIAccess',
        'requestMediaKeySystemAccess',
        'setAppBadge',
        'webkitGetUserMedia',
        'clearOriginJoinedAdInterestGroups',
        'createAuctionNonce',
        'joinAdInterestGroup',
        'leaveAdInterestGroup',
        'updateAdInterestGroups',
        'deprecatedReplaceInURN',
        'deprecatedURNToURL',
        'getInstalledRelatedApps',
        'registerProtocolHandler',
        'unregisterProtocolHandler',
      ],
    },
    p: [],
    w: { devicePixelRatio: 4, screenTop: 0, screenLeft: 0 },
    s: { availHeight: 740, availWidth: 360, colorDepth: 24, height: 740, width: 360, pixelDepth: 24 },
    sc: {
      ActiveBorder: 'rgb(0, 0, 0)',
      ActiveCaption: 'rgb(0, 0, 0)',
      AppWorkspace: 'rgb(255, 255, 255)',
      Background: 'rgb(255, 255, 255)',
      ButtonFace: 'rgb(240, 240, 240)',
      ButtonHighlight: 'rgb(240, 240, 240)',
      ButtonShadow: 'rgb(240, 240, 240)',
      ButtonText: 'rgb(0, 0, 0)',
      CaptionText: 'rgb(0, 0, 0)',
      GrayText: 'rgb(109, 109, 109)',
      Highlight: 'rgba(0, 86, 205, 0.8)',
      HighlightText: 'rgb(255, 255, 255)',
      InactiveBorder: 'rgb(0, 0, 0)',
      InactiveCaption: 'rgb(255, 255, 255)',
      InactiveCaptionText: 'rgb(128, 128, 128)',
      InfoBackground: 'rgb(255, 255, 255)',
      InfoText: 'rgb(0, 0, 0)',
      Menu: 'rgb(255, 255, 255)',
      MenuText: 'rgb(0, 0, 0)',
      Scrollbar: 'rgb(255, 255, 255)',
      ThreeDDarkShadow: 'rgb(0, 0, 0)',
      ThreeDFace: 'rgb(240, 240, 240)',
      ThreeDHighlight: 'rgb(0, 0, 0)',
      ThreeDLightShadow: 'rgb(0, 0, 0)',
      ThreeDShadow: 'rgb(0, 0, 0)',
      Window: 'rgb(255, 255, 255)',
      WindowFrame: 'rgb(0, 0, 0)',
      WindowText: 'rgb(0, 0, 0)',
    },
    ss: { cookie: true, localStorage: true, sessionStorage: true, globalStorage: false, indexedDB: true },
    tz: -480,
    lil: '',
    wil: '',
  });

  const a = TDEncrypt({
    pin: '',
    oid: '',
    bizId: bizId,
    fc: '',
    mode: 'strict',
    p: 's',
    fp: 'b772d9635edebaa1a47c5a1fd086186a',
    ctype: 1,
    v: '3.2.1.0',
    f: '3',
    o: getCurrentPageUrl(url),
    qs: '',
    qi: '',
  });

  let { status, data } = await axios({
    method: 'POST',
    url: `https://jra.jd.com/jsTk.do?a=${encodeURIComponent(a)}`,
    headers: {
      'User-Agent': userAgent,
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    data: qs.stringify({
      d: d,
    }),
  });
  if (status === 200 && data.data) {
    return data.data;
  } else return null;
}

module.exports.getJsToken = getJsToken;

