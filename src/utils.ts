const _AS_AVATAR = 'as avatar';
const _TRUE = 'true';
const _FALSE = 'false';
const _ALL_NONE_KEY = '_allNone';

export function _splitPipeline(value: string) {
    return value.split('|').map((p) => p.trim());
}
export function _delete_parameters_duplicates(parameters: any, exportParameters: any) {
    let subtype: any = Object.keys(parameters);
    if (!subtype.length) return parameters;
    subtype = subtype[0];
  
    Object.keys(exportParameters).forEach((epCat) => {
      let present = parameters[subtype].hasOwnProperty(epCat);
      if (!present) return;
      delete parameters[subtype][epCat];
    });
  
    return parameters;
}

export function _jsonResponse(responsePromise: Promise<any>) {
    return new Promise((resolve, reject) => {
      responsePromise.then((rsp) => {
        if (!rsp.ok) {
          return rsp.json().then((j: any) => {
            return reject(j)
          }).catch(() => {
            return reject(rsp);
          })
        }

        return rsp.json().then(resolve);
      })
    })
}

export function _cmp(a: number, b: number) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
}

export function _getAvatarExport(exports: any, asdk: any, idx=0) {
    if (idx > exports.length) return undefined;
  
    if (exports.length > 1) {
      exports.sort((a: { [x: string]: number; }, b: { [x: string]: number; }) => _cmp(a['created_on'], b['created_on']));
    }
  
    let aExport = exports[idx];
    let isCompleted = aExport['status'] === 'Completed';
  
    if (!isCompleted) return asdk.poll_export(aExport);
  
    return Promise.resolve(aExport);
}

export function _now() {
    return Math.round(Date.now()/1000);
}
  
export function _copy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}
export function _convertGuiColor(v: { [x: string]: any; }) {
    return {'red': v['r'], 'green': v['g'], 'blue': v['b']};
}
export function generateExportParameters(parameters: any) {
  let _processListParameter = (listParameter: any) => Object.entries(listParameter).reduce((a: any[],i: any[]) => {
    if (i[1] === true) a.push(i[0]);
    return a;
  }, []);

  let _processInheritOptions = (value: any) => {
    switch (value) {
    case _AS_AVATAR:
      return null;
    case _TRUE:
      return true;
    case _FALSE:
      return false;
    }

    return _copy(value);
  }

  let _processSection = (root: any) => {
    let ret: any = {};

    for (const [key, value] of Object.entries(root)) {
      switch (key) {
      case 'format':
      case 'embed':
      case 'pointclouds':
      case 'embed_textures': {
        let v = _processInheritOptions(value);
        if (v === null) continue;
        ret[key] = v;
        break;
      }
      case 'additional_textures':
      case 'list': {
        let v = _processListParameter(value);
        if (v.length === 0) continue;
        ret[key] = v;
        break;
      }
      case 'lod':
      case 'color':
      case 'texture_size': {
        // @ts-ignore
        if (!value['enabled']) continue;
        // @ts-ignore
        let v = value['value'];
        v = (key === 'color') ? _convertGuiColor(v) : _copy(v);
        ret[key] = v;
        break;
      }
      case 'haircuts':
      case 'outfits':
      case 'blendshapes': {
        let v = _processSection(value);
        if (Object.keys(v).length === 0) continue;
        ret[key] = v;
        break;
      }
      case _ALL_NONE_KEY:
        break;
      default:
        console.log('unknown key "%s"', key);
      }
    }

    return ret;
  }

  let ret = _processSection(parameters);

  return ret;
}

export function _getDefault(obj: { [x: string]: any; format?: string; embed?: boolean; embed_textures?: boolean; }, key: string, dflt: {}) {
    if (!(key in obj)) {
      obj[key] = dflt;
    };
    return obj[key];
}

export function generateVisualExportParameters(parameters: any) {
  let ret = {
    'format': 'glb',
    'embed': true,
    'embed_textures': true,
  };

  const _keysToCopy = ['lod', 'texture_size', 'color'];
  const _catToCopy = ['', 'haircuts', 'outfits'];

  for (const category of _catToCopy) {
    let root = parameters;
    let target: any = ret;

    if (!!category) {
      root = parameters?.[category];
      if (root === undefined) continue;

      target = _getDefault(ret, category, {});

      let catList = root.list;

      let valid = (!!catList) && catList.length > 0;
      if (valid) {
        target['list'] = [catList[0]]
      };
    }

    for (const key of _keysToCopy) {
      let value = root?.[key];
      if (value === undefined) continue;

      target[key] = value;
    }
  }

  return ret;
}

export function visualizeExport(avatarExport: { [x: string]: any; }, asdk: any){
  let avatarExportFile = undefined;
  for (const exportFile of avatarExport['files']) {
    if (exportFile['identity'] !== 'avatar') continue;
    avatarExportFile = exportFile;
    break;
  } 
  let onProgress = (stage: any, pct: string) => {
    pct = (!!pct) ? pct + '%' : '';
    console.log(pct)
  }

  asdk.get_export_file_contents(
    avatarExportFile, onProgress
  ).then((modelFiles: any) => {
    console.log(modelFiles)
  })
}