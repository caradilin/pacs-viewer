/** @type {AppTypes.Config} */

// 对接 pacs-web 同一套 PACS 的 DICOMweb 服务（杭州测试环境）。
// 与 pacs-web 的 src/config/env.js 里 30001 的管理 REST 接口不同，
// OHIF 走标准 DICOMweb（QIDO-RS / WADO-RS），地址为 30102 端口的 /dicomweb。
//
// 启动：pnpm dev:pacs（根目录）
//
// 已实测（2026-09-17）：
// - /studies、/studies/{uid}/series QIDO 正常（含通配符查询）
// - /studies/{uid}/series/{suid}/metadata 为标准 WADO-RS 格式
// - /studies/{uid}/series/{suid}/instances/{iid}/frames/{n} 可取像素，
//   以单部分 application/octet-stream 返回（cornerstone 加载器兼容）
// - CORS 已放开（允许 localhost 跨域 + authorization 头）
//
// 已知服务端问题（修复后无需改此文件）：
// - metadata 中 rows/cols/pixelSpacing 与真实 DICOM 不符（写成了 256×256 /
//   0.9375，实际 512×512 / 0.9765625），会导致 OHIF 渲染花屏，需后端修正
// - QIDO /instances 返回空数组（懒加载主链路不依赖它，暂不影响）
// - study 级 /metadata 为非标准简化 JSON，因此必须保持 enableStudyLazyLoad: true
window.config = {
  name: 'config/pacs.js',
  routerBasename: null,
  extensions: [],
  modes: [],
  showStudyList: true,
  maxNumberOfWebWorkers: 3,
  showWarningMessageForCrossOrigin: true,
  showCPUFallbackMessage: true,
  showLoadingIndicator: true,
  experimentalStudyBrowserSort: false,
  strictZSpacingForVolumeViewport: true,
  groupEnabledModesFirst: true,
  allowMultiSelectExport: false,
  maxNumRequests: {
    interaction: 100,
    thumbnail: 5,
    prefetch: 25,
  },
  showErrorDetails: 'always',
  defaultDataSourceName: 'pacs',
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'pacs',
      configuration: {
        friendlyName: 'PACS DICOMWeb（同 pacs-web 后端）',
        name: 'PACS',
        wadoUriRoot: 'http://10.23.103.145:30102/dicomweb',
        qidoRoot: 'http://10.23.103.145:30102/dicomweb',
        wadoRoot: 'http://10.23.103.145:30102/dicomweb',
        qidoSupportsIncludeField: true,
        supportsReject: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        staticWado: false,
        // 服务器返回的 BulkDataURI 是相对路径（instances/{uid}/frames，
        // 缺少 series 段），按标准解析会 404；禁用后加载器自行按
        // wadoRoot/studies/.../instances/{iid}/frames/{n} 完整路径取像素。
        bulkDataURI: {
          enabled: false,
        },
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomlocal',
      sourceName: 'dicomlocal',
      configuration: {
        friendlyName: 'dicom local',
      },
    },
  ],
  httpErrorHandler: error => {
    console.warn(error.status);
  },
};
