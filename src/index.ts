import * as ASDK from "./asdk";
import {
  _splitPipeline,
  _delete_parameters_duplicates,
  _jsonResponse,
  _getDefault,
  _now,
  _getAvatarExport,
  generateExportParameters,
  generateVisualExportParameters,
} from "./utils";

//const AUTH_URL = "https://api.avatarsdk.com/o/token/";
const AUTH_URL = "https://avatar-api.itseez3d.com/o/token/";
//const API_URL = "https://api.avatarsdk.com/";

const API_URL = "https://avatar-api.itseez3d.com/";
const stored_client_id = "wl9sluOVVNMHtdyqOWnERP5RgukcKPbJUebgJJxe";
const stored_client_secret =
  "6WBxXOq3lghNyDGadIuf2BzX9harUrO1RMd6sQ05NYBJAldm0EsywuT47k9IiaEaqE0RMRILumTv0ygN3ZVfpoiyoYkW4LHfhp3lmmJkN3mMIZJkP9aMUOCmjuIgeUM5";
const pipelineValue = "head_1.2 | base/static";

async function getToken() {
  let stored_token: any = localStorage.getItem("access_token");
  console.log("1234567");
  if (!!stored_token) {
    stored_token = JSON.parse(stored_token);
    let expired = _now() >= stored_token.expires - 60 * 5;
    if (!expired) {
      return stored_token.access_token;
    } else {
      localStorage.removeItem("access_token");
    }
  }

  let auth = "Basic " + btoa(stored_client_id + ":" + stored_client_secret);
  let headers = {
    Authorization: auth,
  };

  let auth_form = new FormData();
  auth_form.append("grant_type", "client_credentials");

  // token 鉴权
  return fetch(AUTH_URL, {
    headers: headers,
    method: "POST",
    body: auth_form,
  })
    .then((rsp) => rsp.json())
    .then((rsp) => {
      rsp.expires = _now() + rsp.expires_in;
      localStorage.setItem("access_token", JSON.stringify(rsp));
      return rsp.access_token;
    });
}

async function initASDK(token: any) {
  let asdk = new ASDK.AvatarSDK(token, API_URL);
  let [pipeline, subtype] = _splitPipeline(pipelineValue);
  let parametersPromise = asdk.get_available_parameters(pipeline, subtype);
  let exportParametersPromise = asdk.get_available_export_parameters(
    pipeline,
    subtype
  );
  return Promise.all([parametersPromise, exportParametersPromise]).then(
    (promises) => {
      let [parameters, exportParameters] = promises;
      parameters = _delete_parameters_duplicates(parameters, exportParameters);
      return { parameters, asdk };
    }
  );
}

async function uploadFile(
  photo: any,
  token: any,
  returnDataType = "fileBlob",
  onCompletedProgress: (data: any) => void,
  onExportProgress: (data: any) => void,
  callback: (data: any) => void
) {
  const { asdk } = await initASDK(token); // init sdk
  let parameters = JSON.stringify({});
  let [pipeline, subtype] = _splitPipeline(pipelineValue);
  let export_parameters = generateExportParameters({
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
  let visual_export_parameters =
    generateVisualExportParameters(export_parameters);
  export_parameters = JSON.stringify([
    visual_export_parameters,
    export_parameters,
  ]);

  let onProgress = (a: any) => {
    onCompletedProgress && onCompletedProgress(a);
  };

  asdk
    .create_avatar(
      "test",
      photo,
      pipeline,
      subtype,
      parameters,
      export_parameters
    )
    .then((avatar) => asdk.poll_avatar(avatar, onProgress))
    .then((avatar) => asdk.get_exports(avatar))
    .then((exports) => {
      return _getAvatarExport(exports, asdk);
    })
    .then((avatarExport) => {
      if (returnDataType === "fileBlob") {
        let avatarExportFile = undefined;
        for (const exportFile of avatarExport["files"]) {
          if (exportFile["identity"] !== "avatar") continue;
          avatarExportFile = exportFile;
          break;
        }
        let onProgress = (stage: any, pct: any) => {
          onExportProgress &&
            onExportProgress({
              stage,
              pct,
            });
        };
        asdk
          .get_export_file_contents(avatarExportFile, onProgress)
          .then((modelFiles) => {
            callback && callback(modelFiles);
          });
      } else {
        let exportFiles: any = avatarExport["files"].reduce((a: any, i: any) => {
          let cat = i["category"] || "avatar";
          let k = i["identity"];
          _getDefault(a, cat, {})[k] = i;
          return a;
        }, {});
        for (const [cat, catEntries] of Object.entries(exportFiles)) {
          for (const [identity, ef] of Object.entries(catEntries as any)) {
            let url = (ef as any).file ;
            let filename = url.split("/");
            filename = filename[filename.length - 1];
            asdk
              .download_export_file(url, filename, false)
              .then((link) => {
                callback && callback(link);
              })
              .catch((err) => {
                console.error(err);
              });
          }
        }
      }
    })
    .catch((err) => {
      console.error("catch error:", err);
    });
}

async function threedsuperme(
  file: any,
  { returnDataType, onCompletedProgress, onExportProgress, callback }: {
    returnDataType: string,
    onCompletedProgress: (data: any)=> void,
    onExportProgress: (data: any)=> void,
    callback: (data: any)=> void,
  }
) {
  const token = await getToken(); // token
  return await uploadFile(
    file,
    token,
    returnDataType,
    onCompletedProgress,
    onExportProgress,
    callback
  ); // file 文件上传
}

export default threedsuperme;
