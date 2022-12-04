import React, { useState, useEffect } from 'react';
import './App.css';
import threedsuperme from './dist'
import * as AvatarsGL from './avatars_gl.js';

const App = () => {
  const [load, setLoad] = useState(false)
  useEffect(()=>{
    const inputEle = document.getElementById('inputEle');
    const canvasEle = document.getElementById('canvas');
    if(inputEle){
      AvatarsGL.init_gl(canvasEle);
      inputEle.addEventListener('change', (e)=>{
        setLoad(true)
        AvatarsGL.reset();
        const file = e.target.files[0];
        threedsuperme(file, {
          returnDataType: 'fileBlob', // 'fileBlob' fileUrl文件下载地址 、fileBlob文件数据流
          onCompletedProgress: function(state){
            console.log(state) // 模型生成完成度
          },
          onExportProgress: function(state){
            console.log(state) // 模型下载完成度
          },
          callback: function(data){
            console.log(data) // 模型返回的数据
            AvatarsGL.display(data)
          }
        });
      })
    }
  },[])
  return (
    <div className="App">
      <header className="App-header">
        <p>3DSperme Demo</p>
        <p>
          <input type="file" id="inputEle" />
        </p>
        <p>{load && 'loading。。。。。。'}</p>
        <canvas id="canvas"></canvas>
      </header>
    </div>
  );
};

export default App;
