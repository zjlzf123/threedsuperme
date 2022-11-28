var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var _AS_AVATAR = 'as avatar';
var _TRUE = 'true';
var _FALSE = 'false';
var _ALL_NONE_KEY = '_allNone';
export function _splitPipeline(value) {
    return value.split('|').map(function (p) { return p.trim(); });
}
export function _delete_parameters_duplicates(parameters, exportParameters) {
    var subtype = Object.keys(parameters);
    if (!subtype.length)
        return parameters;
    subtype = subtype[0];
    Object.keys(exportParameters).forEach(function (epCat) {
        var present = parameters[subtype].hasOwnProperty(epCat);
        if (!present)
            return;
        delete parameters[subtype][epCat];
    });
    return parameters;
}
export function _jsonResponse(responsePromise) {
    return new Promise(function (resolve, reject) {
        responsePromise.then(function (rsp) {
            if (!rsp.ok) {
                return rsp.json().then(function (j) {
                    return reject(j);
                }).catch(function () {
                    return reject(rsp);
                });
            }
            return rsp.json().then(resolve);
        });
    });
}
export function _cmp(a, b) {
    if (a > b)
        return 1;
    if (a < b)
        return -1;
    return 0;
}
export function _getAvatarExport(exports, asdk, idx) {
    if (idx === void 0) { idx = 0; }
    if (idx > exports.length)
        return undefined;
    if (exports.length > 1) {
        exports.sort(function (a, b) { return _cmp(a['created_on'], b['created_on']); });
    }
    var aExport = exports[idx];
    var isCompleted = aExport['status'] === 'Completed';
    if (!isCompleted)
        return asdk.poll_export(aExport);
    return Promise.resolve(aExport);
}
export function _now() {
    return Math.round(Date.now() / 1000);
}
export function _copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
export function _convertGuiColor(v) {
    return { 'red': v['r'], 'green': v['g'], 'blue': v['b'] };
}
export function generateExportParameters(parameters) {
    var _processListParameter = function (listParameter) { return Object.entries(listParameter).reduce(function (a, i) {
        if (i[1] === true)
            a.push(i[0]);
        return a;
    }, []); };
    var _processInheritOptions = function (value) {
        switch (value) {
            case _AS_AVATAR:
                return null;
            case _TRUE:
                return true;
            case _FALSE:
                return false;
        }
        return _copy(value);
    };
    var _processSection = function (root) {
        var e_1, _a;
        var ret = {};
        try {
            for (var _b = __values(Object.entries(root)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                switch (key) {
                    case 'format':
                    case 'embed':
                    case 'pointclouds':
                    case 'embed_textures': {
                        var v = _processInheritOptions(value);
                        if (v === null)
                            continue;
                        ret[key] = v;
                        break;
                    }
                    case 'additional_textures':
                    case 'list': {
                        var v = _processListParameter(value);
                        if (v.length === 0)
                            continue;
                        ret[key] = v;
                        break;
                    }
                    case 'lod':
                    case 'color':
                    case 'texture_size': {
                        // @ts-ignore
                        if (!value['enabled'])
                            continue;
                        // @ts-ignore
                        var v = value['value'];
                        v = (key === 'color') ? _convertGuiColor(v) : _copy(v);
                        ret[key] = v;
                        break;
                    }
                    case 'haircuts':
                    case 'outfits':
                    case 'blendshapes': {
                        var v = _processSection(value);
                        if (Object.keys(v).length === 0)
                            continue;
                        ret[key] = v;
                        break;
                    }
                    case _ALL_NONE_KEY:
                        break;
                    default:
                        console.log('unknown key "%s"', key);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return ret;
    };
    var ret = _processSection(parameters);
    return ret;
}
export function _getDefault(obj, key, dflt) {
    if (!(key in obj)) {
        obj[key] = dflt;
    }
    ;
    return obj[key];
}
export function generateVisualExportParameters(parameters) {
    var e_2, _a, e_3, _b;
    var ret = {
        'format': 'glb',
        'embed': true,
        'embed_textures': true,
    };
    var _keysToCopy = ['lod', 'texture_size', 'color'];
    var _catToCopy = ['', 'haircuts', 'outfits'];
    try {
        for (var _catToCopy_1 = __values(_catToCopy), _catToCopy_1_1 = _catToCopy_1.next(); !_catToCopy_1_1.done; _catToCopy_1_1 = _catToCopy_1.next()) {
            var category = _catToCopy_1_1.value;
            var root = parameters;
            var target = ret;
            if (!!category) {
                root = parameters === null || parameters === void 0 ? void 0 : parameters[category];
                if (root === undefined)
                    continue;
                target = _getDefault(ret, category, {});
                var catList = root.list;
                var valid = (!!catList) && catList.length > 0;
                if (valid) {
                    target['list'] = [catList[0]];
                }
                ;
            }
            try {
                for (var _keysToCopy_1 = (e_3 = void 0, __values(_keysToCopy)), _keysToCopy_1_1 = _keysToCopy_1.next(); !_keysToCopy_1_1.done; _keysToCopy_1_1 = _keysToCopy_1.next()) {
                    var key = _keysToCopy_1_1.value;
                    var value = root === null || root === void 0 ? void 0 : root[key];
                    if (value === undefined)
                        continue;
                    target[key] = value;
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_keysToCopy_1_1 && !_keysToCopy_1_1.done && (_b = _keysToCopy_1.return)) _b.call(_keysToCopy_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_catToCopy_1_1 && !_catToCopy_1_1.done && (_a = _catToCopy_1.return)) _a.call(_catToCopy_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return ret;
}
export function visualizeExport(avatarExport, asdk) {
    var e_4, _a;
    var avatarExportFile = undefined;
    try {
        for (var _b = __values(avatarExport['files']), _c = _b.next(); !_c.done; _c = _b.next()) {
            var exportFile = _c.value;
            if (exportFile['identity'] !== 'avatar')
                continue;
            avatarExportFile = exportFile;
            break;
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_4) throw e_4.error; }
    }
    var onProgress = function (stage, pct) {
        pct = (!!pct) ? pct + '%' : '';
        console.log(pct);
    };
    asdk.get_export_file_contents(avatarExportFile, onProgress).then(function (modelFiles) {
        console.log(modelFiles);
    });
}
