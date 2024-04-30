// 顶点着色器程序
var vertexShaderSource =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_MvpMatrix;\n' + // 模型视图投影矩阵
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_Color = a_Color;\n' +
    '}\n';
// 片元着色器程序
var fragmentShaderSource =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

var gl;
var program;
function main() {
    // 获取<canvas>元素
    var canvas = document.getElementById('webgl');

    //获取WebGL绘图上下文
    gl = canvas.getContext("webgl2", {
        antialias: false,
    });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // 初始化着色器
    if (!initShaders()) {
        console.log('Failed to initialize shaders.');
        return;
    }
    
    // 设置顶点位置
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }
    // 设置<canvas>的背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // 获取 模型视图投影 矩阵的地址
    var u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
    if (!u_MvpMatrix) { 
        console.log('Failed to get the storage location of u_MvpMatrix');
        return;
    }

    // 初始化矩阵
    var mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(30, 1, 1, 100); // 透视投影矩阵
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0); // 视图矩阵

    // 把矩阵赋值给uniform变量 u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

   
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 绘制一个立方体 n:索引个数，执行顶点着色器的次数
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
    // 绘制立方体
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var verticesColors = new Float32Array([
      // 前面三个是顶点坐标 、 后三个是颜色值。共有8个顶点
       1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
      -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
      -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
       1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
       1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
       1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
      -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
      -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
    ]);
  
    // 顶点索引
    var indices = new Uint8Array([
      0, 1, 2,   0, 2, 3,    // 前
      0, 3, 4,   0, 4, 5,    // 右
      0, 5, 6,   0, 6, 1,    // 上
      1, 6, 7,   1, 7, 2,    // 左
      7, 4, 3,   7, 3, 2,    // 下
      4, 7, 6,   4, 6, 5     // 后
   ]);
  
    // 创建buffer缓冲区
    var vertexColorBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    if (!vertexColorBuffer || !indexBuffer) {
      return -1;
    }
  
    // 把顶点列表绑定在 gl.ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
  
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    // 获取顶点变量a_Position的存储位置
    var a_Position = gl.getAttribLocation(program, 'a_Position');
    if(a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);
    // 获取颜色变量a_Color的存储位置
    var a_Color = gl.getAttribLocation(program, 'a_Color');
    if(a_Color < 0) {
      console.log('Failed to get the storage location of a_Color');
      return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);
  
    // 将顶点索引数据写入缓冲区对象
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
    return indices.length;
  }
  






function initShaders() {
    // 创建顶点着色器对象
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    // 指定着色器对象的代码
    gl.shaderSource(vertexShader, vertexShaderSource);
    // 编译着色器
    gl.compileShader(vertexShader);
    // 通过getShaderParameter()检查着色器的状态 gl.COMPILE_STATUS:指定待获取参数的类型
    // 如果编译失败会返回false
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      // gl.getShaderInfoLog(shader): 获取着色器编译错误信息
      console.error(gl.getShaderInfoLog(vertexShader));
    }
    // 创建片元着色器
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    // 指定片元着色器对象的代码
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(fragmentShader));
    }
    // 创建程序对象：包含了顶点着色器和片元着色器
    program = gl.createProgram();
    // 为程序对象分配着色器对象：顶点着色器、片元着色器
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // 连接程序对象：将顶点着色器和片元着色器连接起来
    gl.linkProgram(program);
    // 告知WebGL系统所使用的程序对象：该函数允许WebGL在绘制前准备多个程序对象
    // 然后在绘制的时候根据需要切换程序对象
    gl.useProgram(program);  
    return true;

}