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
import { loadAsync } from "jszip";
var AvatarSDK = /** @class */ (function () {
    function AvatarSDK(token, url) {
        this.token = token;
        this._auth_header = "Bearer " + token;
        this.base_url = url;
        this._x_user_agent = "asdk.js/0.2 (" + window.location.host + ")";
    }
    AvatarSDK.prototype._url = function (url) {
        return new URL(url, this.base_url);
    };
    AvatarSDK.prototype._performRequest = function (url, fetchObj) {
        if (fetchObj === void 0) { fetchObj = {}; }
        var headers = fetchObj["headers"] || {};
        headers["Authorization"] = this._auth_header;
        headers["X-User-Agent"] = this._x_user_agent;
        fetchObj["headers"] = headers;
        return fetch(url, fetchObj);
    };
    AvatarSDK.prototype._jsonResponse = function (responsePromise) {
        return new Promise(function (resolve, reject) {
            responsePromise.then(function (rsp) {
                if (!rsp.ok) {
                    return rsp
                        .json()
                        .then(function (j) {
                        return reject(j);
                    })
                        .catch(function () {
                        return reject(rsp);
                    });
                }
                return rsp.json().then(resolve);
            });
        });
    };
    AvatarSDK.prototype.get_available_parameters = function (pipeline, subtype) {
        var url = this._url("/parameters/available/" + pipeline + "/");
        url.searchParams.append("pipeline_subtype", subtype);
        return this._jsonResponse(this._performRequest(url));
    };
    AvatarSDK.prototype.get_available_export_parameters = function (pipeline, subtype) {
        var url = this._url("/export_parameters/available/" + pipeline + "/");
        url.searchParams.append("pipeline_subtype", subtype);
        return this._jsonResponse(this._performRequest(url));
    };
    AvatarSDK.prototype.create_avatar = function (name, photo, pipeline, subtype, parameters, export_parameters) {
        var form = new FormData();
        form.append("name", name);
        form.append("photo", photo, photo.name);
        form.append("pipeline", pipeline);
        form.append("pipeline_subtype", subtype);
        form.append("parameters", parameters);
        form.append("export_parameters", export_parameters);
        var url = this._url("/avatars/");
        return this._jsonResponse(this._performRequest(url, {
            method: "POST",
            body: form,
        }));
    };
    AvatarSDK.prototype.get_avatar = function (avatar) {
        var url = avatar["url"];
        return this._jsonResponse(this._performRequest(url));
    };
    AvatarSDK.prototype._poll_impl = function (avatar, resolve, reject, onProgress, iIntervalGetter) {
        this.get_avatar(avatar)
            .then(function (j) {
            var status = j["status"];
            if (!!onProgress)
                onProgress(j);
            switch (status) {
                case "Completed":
                    clearInterval(iIntervalGetter());
                    return resolve(j);
                case "Failed":
                case "Timed Out":
                    clearInterval(iIntervalGetter());
                    return reject(j);
                case "Pending":
                case "Uploading":
                case "Queued":
                case "Computing":
                    break;
                default:
                    console.log('unknown status "%s"', status);
            }
        })
            .catch(function (err) {
            console.log(err);
            clearInterval(iIntervalGetter());
            return reject(err);
        });
    };
    AvatarSDK.prototype.poll_avatar = function (avatar, onProgress) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var iInterval = null;
            iInterval = setInterval(_this._poll_impl.bind(_this), 5000, avatar, resolve, reject, onProgress, function () { return iInterval; });
        });
    };
    AvatarSDK.prototype.get_exports = function (avatar) {
        var url = avatar["exports"];
        return this._jsonResponse(this._performRequest(url));
    };
    AvatarSDK.prototype.poll_export = function (avatarExport, onProgress) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var iInterval = null;
            iInterval = setInterval(_this._poll_impl.bind(_this), 5000, avatarExport, resolve, reject, onProgress, function () { return iInterval; });
        });
    };
    AvatarSDK.prototype.download_export_file = function (url, filename, useBlob) {
        if (useBlob === void 0) { useBlob = false; }
        if (useBlob) {
            return this._performRequest(url)
                .then(function (r) { return r.blob(); })
                .then(function (b) {
                var fBlob = new File([b], filename, { type: b.type });
                var bUrl = URL.createObjectURL(fBlob);
                return bUrl;
            });
        }
        else {
            var href = new URL(url);
            href.searchParams.append("access_token", this.token);
            return Promise.resolve(href);
        }
    };
    AvatarSDK.prototype._extractZipFiles = function (blob) {
        return loadAsync(blob).then(function (z) {
            var e_1, _a;
            var promises = [];
            var _loop_1 = function (zipFile) {
                if (zipFile.dir)
                    return "continue";
                var filename = zipFile.name.split("/");
                filename = filename[filename.length - 1];
                var p = zipFile.async("blob").then(function (b) {
                    var r = {};
                    r[filename] = b;
                    return r;
                });
                promises.push(p);
            };
            try {
                for (var _b = __values(Object.values(z.files)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var zipFile = _c.value;
                    _loop_1(zipFile);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return Promise.all(promises).then(function (blobs) {
                return blobs.reduce(function (a, i) {
                    Object.assign(a, i);
                    return a;
                }, {});
            });
        });
    };
    AvatarSDK.prototype.get_export_file_contents = function (avatarExportFile, onProgress) {
        var _this = this;
        var fileUrl = avatarExportFile["file"];
        var zipFilesPromises = this._performRequest(fileUrl)
            .then(function (response) {
            if (!response.ok) {
                throw Error(response.status + " " + response.statusText);
            }
            if (!response.body) {
                throw Error("ReadableStream not yet supported in this browser.");
            }
            // to access headers, server must send CORS header "Access-Control-Expose-Headers: content-encoding, content-length x-file-size"
            // server must send custom x-file-size header if gzip or other content-encoding is used
            var contentEncoding = response.headers.get("content-encoding");
            var contentLength = response.headers.get(contentEncoding ? "x-file-size" : "content-length");
            if (contentLength === null) {
                throw Error("Response size header unavailable");
            }
            var total = parseInt(contentLength, 10);
            var loaded = 0;
            return new Response(new ReadableStream({
                start: function (controller) {
                    var reader = response.body.getReader();
                    read();
                    function read() {
                        reader
                            .read()
                            .then(function (_a) {
                            var done = _a.done, value = _a.value;
                            if (done) {
                                controller.close();
                                return;
                            }
                            loaded += value.byteLength;
                            var pct = Math.round((100.0 * loaded) / total);
                            if (!!onProgress)
                                onProgress("Downloading", pct);
                            controller.enqueue(value);
                            read();
                        })
                            .catch(function (error) {
                            console.error(error);
                            controller.error(error);
                        });
                    }
                },
            }));
        })
            .then(function (r) { return r.blob(); })
            .then(function (blob) {
            if (!!onProgress)
                onProgress("Processing");
            return _this._extractZipFiles(blob);
        });
        return zipFilesPromises;
    };
    return AvatarSDK;
}());
export { AvatarSDK };
