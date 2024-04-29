// 顶点着色器程序
var vertexShaderSource =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_ViewMatrix * a_Position;\n' +
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
    var canvas = document.getElementById('webgl');

    gl = canvas.getContext("webgl2", {
        antialias: false,
    });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders()) {
        console.log('Failed to initialize shaders.');
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }
  
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    var u_ViewMatrix = gl.getUniformLocation(program, 'u_ViewMatrix');
    if(!u_ViewMatrix) { 
    console.log('Failed to get the storage locations of u_ViewMatrix');
    return;
    }

    // 创建视图矩阵
    var viewMatrix = new Matrix4();
    // 注册点击事件
    document.onkeydown = function(ev){ keydown(ev, gl, n, u_ViewMatrix, viewMatrix); };

    draw(gl, n, u_ViewMatrix, viewMatrix);   // Draw
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
      // Vertex coordinates and color
       0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // 绿色在后
      -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
       0.5, -0.5,  -0.4,  1.0,  0.4,  0.4, 
     
       0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // 黄色在中
      -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
       0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 
  
       0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  // 蓝色在前
      -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
       0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
    ]);
    var n = 9;
  
    var vertexColorbuffer = gl.createBuffer();  
    if (!vertexColorbuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
  
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(program, 'a_Position');
    if(a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return -1;
    }
  
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);
  
    var a_Color = gl.getAttribLocation(program, 'a_Color');
    if(a_Color < 0) {
      console.log('Failed to get the storage location of a_Color');
      return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);
  
    return n;
  }
  
  var g_eyeX = 0.20, g_eyeY = 0.25, g_eyeZ = 0.25; // 初始化视点
  function keydown(ev, gl, n, u_ViewMatrix, viewMatrix) {
      if(ev.keyCode == 39) { // 按右键
        g_eyeX += 0.01;
      } else 
      if (ev.keyCode == 37) { // 按左键
        g_eyeX -= 0.01;
      } else { return; }
      draw(gl, n, u_ViewMatrix, viewMatrix);    
  }
  
  function draw(gl, n, u_ViewMatrix, viewMatrix) {
    // 设置视图矩阵
    viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
  
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  
    gl.clear(gl.COLOR_BUFFER_BIT);  
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
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