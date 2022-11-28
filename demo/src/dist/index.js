var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
import * as ASDK from "./asdk";
import { _splitPipeline, _delete_parameters_duplicates, _getDefault, _now, _getAvatarExport, generateExportParameters, generateVisualExportParameters, } from "./utils";
var AUTH_URL = "https://api.avatarsdk.com/o/token/";
var API_URL = "https://api.avatarsdk.com/";
var stored_client_id = "wl9sluOVVNMHtdyqOWnERP5RgukcKPbJUebgJJxe";
var stored_client_secret = "6WBxXOq3lghNyDGadIuf2BzX9harUrO1RMd6sQ05NYBJAldm0EsywuT47k9IiaEaqE0RMRILumTv0ygN3ZVfpoiyoYkW4LHfhp3lmmJkN3mMIZJkP9aMUOCmjuIgeUM5";
var pipelineValue = "head_1.2 | base/static";
function getToken() {
    return __awaiter(this, void 0, void 0, function () {
        var stored_token, expired, auth, headers, auth_form;
        return __generator(this, function (_a) {
            stored_token = localStorage.getItem("access_token");
            if (!!stored_token) {
                stored_token = JSON.parse(stored_token);
                expired = _now() >= stored_token.expires - 60 * 5;
                if (!expired) {
                    return [2 /*return*/, stored_token.access_token];
                }
                else {
                    localStorage.removeItem("access_token");
                }
            }
            auth = "Basic " + btoa(stored_client_id + ":" + stored_client_secret);
            headers = {
                Authorization: auth,
            };
            auth_form = new FormData();
            auth_form.append("grant_type", "client_credentials");
            // token 鉴权
            return [2 /*return*/, fetch(AUTH_URL, {
                    headers: headers,
                    method: "POST",
                    body: auth_form,
                })
                    .then(function (rsp) { return rsp.json(); })
                    .then(function (rsp) {
                    rsp.expires = _now() + rsp.expires_in;
                    localStorage.setItem("access_token", JSON.stringify(rsp));
                    return rsp.access_token;
                })];
        });
    });
}
function initASDK(token) {
    return __awaiter(this, void 0, void 0, function () {
        var asdk, _a, pipeline, subtype, parametersPromise, exportParametersPromise;
        return __generator(this, function (_b) {
            asdk = new ASDK.AvatarSDK(token, API_URL);
            _a = __read(_splitPipeline(pipelineValue), 2), pipeline = _a[0], subtype = _a[1];
            parametersPromise = asdk.get_available_parameters(pipeline, subtype);
            exportParametersPromise = asdk.get_available_export_parameters(pipeline, subtype);
            return [2 /*return*/, Promise.all([parametersPromise, exportParametersPromise]).then(function (promises) {
                    var _a = __read(promises, 2), parameters = _a[0], exportParameters = _a[1];
                    parameters = _delete_parameters_duplicates(parameters, exportParameters);
                    return { parameters: parameters, asdk: asdk };
                })];
        });
    });
}
function uploadFile(photo, token, returnDataType, onCompletedProgress, onExportProgress, callback) {
    if (returnDataType === void 0) { returnDataType = "fileBlob"; }
    return __awaiter(this, void 0, void 0, function () {
        var asdk, parameters, _a, pipeline, subtype, export_parameters, visual_export_parameters, onProgress;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, initASDK(token)];
                case 1:
                    asdk = (_b.sent()).asdk;
                    parameters = JSON.stringify({});
                    _a = __read(_splitPipeline(pipelineValue), 2), pipeline = _a[0], subtype = _a[1];
                    export_parameters = generateExportParameters({
                        format: "obj",
                        embed: true,
                        pointclouds: false,
                        additional_textures: {
                            roughness_map: false,
                            metallic_map: false,
                            lips_mask: false,
                        },
                        embed_textures: false,
                        texture_size: { enabled: false, value: { width: 0, height: 0 } },
                        lod: { enabled: false, value: 0 },
                    });
                    visual_export_parameters = generateVisualExportParameters(export_parameters);
                    export_parameters = JSON.stringify([
                        visual_export_parameters,
                        export_parameters,
                    ]);
                    onProgress = function (a) {
                        onCompletedProgress && onCompletedProgress(a);
                    };
                    asdk
                        .create_avatar("test", photo, pipeline, subtype, parameters, export_parameters)
                        .then(function (avatar) { return asdk.poll_avatar(avatar, onProgress); })
                        .then(function (avatar) { return asdk.get_exports(avatar); })
                        .then(function (exports) {
                        return _getAvatarExport(exports, asdk);
                    })
                        .then(function (avatarExport) {
                        var e_1, _a, e_2, _b, e_3, _c;
                        if (returnDataType === "fileBlob") {
                            var avatarExportFile = undefined;
                            try {
                                for (var _d = __values(avatarExport["files"]), _e = _d.next(); !_e.done; _e = _d.next()) {
                                    var exportFile = _e.value;
                                    if (exportFile["identity"] !== "avatar")
                                        continue;
                                    avatarExportFile = exportFile;
                                    break;
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                            var onProgress_1 = function (stage, pct) {
                                onExportProgress &&
                                    onExportProgress({
                                        stage: stage,
                                        pct: pct,
                                    });
                            };
                            asdk
                                .get_export_file_contents(avatarExportFile, onProgress_1)
                                .then(function (modelFiles) {
                                callback && callback(modelFiles);
                            });
                        }
                        else {
                            var exportFiles = avatarExport["files"].reduce(function (a, i) {
                                var cat = i["category"] || "avatar";
                                var k = i["identity"];
                                _getDefault(a, cat, {})[k] = i;
                                return a;
                            }, {});
                            try {
                                for (var _f = __values(Object.entries(exportFiles)), _g = _f.next(); !_g.done; _g = _f.next()) {
                                    var _h = __read(_g.value, 2), cat = _h[0], catEntries = _h[1];
                                    try {
                                        for (var _j = (e_3 = void 0, __values(Object.entries(catEntries))), _k = _j.next(); !_k.done; _k = _j.next()) {
                                            var _l = __read(_k.value, 2), identity = _l[0], ef = _l[1];
                                            var url = ef.file;
                                            var filename = url.split("/");
                                            filename = filename[filename.length - 1];
                                            asdk
                                                .download_export_file(url, filename, false)
                                                .then(function (link) {
                                                callback && callback(link);
                                            })
                                                .catch(function (err) {
                                                console.error(err);
                                            });
                                        }
                                    }
                                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                    finally {
                                        try {
                                            if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
                                        }
                                        finally { if (e_3) throw e_3.error; }
                                    }
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                        }
                    })
                        .catch(function (err) {
                        console.error("catch error:", err);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function threedsuperme(file, _a) {
    var returnDataType = _a.returnDataType, onCompletedProgress = _a.onCompletedProgress, onExportProgress = _a.onExportProgress, callback = _a.callback;
    return __awaiter(this, void 0, void 0, function () {
        var token;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getToken()];
                case 1:
                    token = _b.sent();
                    return [4 /*yield*/, uploadFile(file, token, returnDataType, onCompletedProgress, onExportProgress, callback)];
                case 2: // token
                return [2 /*return*/, _b.sent()]; // file 文件上传
            }
        });
    });
}
export default threedsuperme;
