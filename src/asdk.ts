import { loadAsync } from "jszip";

export class AvatarSDK {
  [key: string]: any;
  constructor(token: string, url: string) {
    this.token = token;
    this._auth_header = "Bearer " + token;
    this.base_url = url;

    this._x_user_agent = "asdk.js/0.2 (" + window.location.host + ")";
  }

  _url(url: string | URL) {
    return new URL(url, this.base_url);
  }

  _performRequest(url: any, fetchObj: any = {}) {
    let headers = fetchObj["headers"] || {};
    headers["Authorization"] = this._auth_header;
    headers["X-User-Agent"] = this._x_user_agent;
    fetchObj["headers"] = headers;

    return fetch(url, fetchObj);
  }

  _jsonResponse(responsePromise: Promise<any>) {
    return new Promise((resolve, reject) => {
      responsePromise.then((rsp) => {
        if (!rsp.ok) {
          return rsp
            .json()
            .then((j: any) => {
              return reject(j);
            })
            .catch(() => {
              return reject(rsp);
            });
        }

        return rsp.json().then(resolve);
      });
    });
  }

  get_available_parameters(pipeline: string, subtype: string) {
    let url = this._url("/parameters/available/" + pipeline + "/");
    url.searchParams.append("pipeline_subtype", subtype);

    return this._jsonResponse(this._performRequest(url));
  }

  get_available_export_parameters(pipeline: string, subtype: string) {
    let url = this._url("/export_parameters/available/" + pipeline + "/");
    url.searchParams.append("pipeline_subtype", subtype);

    return this._jsonResponse(this._performRequest(url));
  }

  create_avatar(name: string, photo: any, pipeline: string, subtype: string, parameters: any, export_parameters: any) {
    let form = new FormData();

    form.append("name", name);
    form.append("photo", photo, photo.name);
    form.append("pipeline", pipeline);
    form.append("pipeline_subtype", subtype);
    form.append("parameters", parameters);
    form.append("export_parameters", export_parameters);

    let url = this._url("/avatars/");

    return this._jsonResponse(
      this._performRequest(url, {
        method: "POST",
        body: form,
      })
    );
  }

  get_avatar(avatar: { [x: string]: any; }) {
    let url = avatar["url"];

    return this._jsonResponse(this._performRequest(url));
  }

  _poll_impl(avatar: any, resolve: any, reject: any, onProgress: any, iIntervalGetter: any) {
    this.get_avatar(avatar)
      .then((j: any) => {
        let status = j["status"];
        if (!!onProgress) onProgress(j);

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
      .catch((err) => {
        console.log(err);
        clearInterval(iIntervalGetter());
        return reject(err);
      });
  }

  poll_avatar(avatar: any, onProgress: any) {
    return new Promise((resolve, reject) => {
      let iInterval: any = null;
      iInterval = setInterval(
        this._poll_impl.bind(this),
        5000,
        avatar,
        resolve,
        reject,
        onProgress,
        () => iInterval
      );
    });
  }

  get_exports(avatar: any) {
    let url = avatar["exports"];

    return this._jsonResponse(this._performRequest(url));
  }

  poll_export(avatarExport: any, onProgress: any) {
    return new Promise((resolve, reject) => {
      let iInterval: any = null;
      iInterval = setInterval(
        this._poll_impl.bind(this),
        5000,
        avatarExport,
        resolve,
        reject,
        onProgress,
        () => iInterval
      );
    });
  }

  download_export_file(url: any, filename: any, useBlob = false) {
    if (useBlob) {
      return this._performRequest(url)
        .then((r) => r.blob())
        .then((b) => {
          let fBlob = new File([b], filename, { type: b.type });
          let bUrl = URL.createObjectURL(fBlob);
          return bUrl;
        });
    } else {
      let href = new URL(url);
      href.searchParams.append("access_token", this.token);
      return Promise.resolve(href);
    }
  }

  _extractZipFiles(blob: any) {
    return loadAsync(blob).then((z) => {
      let promises = [];

      for (const zipFile of Object.values(z.files)) {
        if (zipFile.dir) continue;

        let filename: any = zipFile.name.split("/");
        filename = filename[filename.length - 1];
        let p = zipFile.async("blob").then((b) => {
          let r: any = {};
          r[filename] = b;
          return r;
        });

        promises.push(p);
      }

      return Promise.all(promises).then((blobs) => {
        return blobs.reduce((a, i) => {
          Object.assign(a, i);
          return a;
        }, {});
      });
    });
  }

  get_export_file_contents(avatarExportFile: any, onProgress: any) {
    let fileUrl = avatarExportFile["file"];
    let zipFilesPromises = this._performRequest(fileUrl)
      .then((response: any) => {
        if (!response.ok) {
          throw Error(response.status + " " + response.statusText);
        }

        if (!response.body) {
          throw Error("ReadableStream not yet supported in this browser.");
        }

        // to access headers, server must send CORS header "Access-Control-Expose-Headers: content-encoding, content-length x-file-size"
        // server must send custom x-file-size header if gzip or other content-encoding is used
        const contentEncoding = response.headers.get("content-encoding");
        const contentLength = response.headers.get(
          contentEncoding ? "x-file-size" : "content-length"
        );
        if (contentLength === null) {
          throw Error("Response size header unavailable");
        }

        const total = parseInt(contentLength, 10);
        let loaded = 0;

        return new Response(
          new ReadableStream({
            start(controller) {
              const reader = response.body.getReader();

              read();
              function read() {
                reader
                  .read()
                  .then(({ done, value }: any) => {
                    if (done) {
                      controller.close();
                      return;
                    }
                    loaded += value.byteLength;

                    let pct = Math.round((100.0 * loaded) / total);
                    if (!!onProgress) onProgress("Downloading", pct);

                    controller.enqueue(value);
                    read();
                  })
                  .catch((error: any) => {
                    console.error(error);
                    controller.error(error);
                  });
              }
            },
          })
        );
      })
      .then((r) => r.blob())
      .then((blob) => {
        if (!!onProgress) onProgress("Processing");
        return this._extractZipFiles(blob);
      });

    return zipFilesPromises;
  }
}
