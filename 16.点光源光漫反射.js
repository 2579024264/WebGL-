var vertexShaderSource =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +   // 模型矩阵
    'uniform mat4 u_NormalMatrix;\n' +  // 用来变换法向量的矩阵
    'uniform vec3 u_LightColor;\n' +    // 光的颜色
    'uniform vec3 u_LightPosition;\n' + // 光源位置
    'uniform vec3 u_AmbientLight;\n' +  // 环境光颜色
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // 计算变换后的法向量，并归一化
    '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    // 计算顶点的世界坐标
    '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
    // 计算光线方向并归一化
    '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
    // 计算光线方向和法向量的点积
    '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    // 计算漫反射光的颜色
    '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
    // 计算环境光产生的反射光的颜色
    '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
    // 将以上两者相加作为最终的颜色
    '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' + 
    '}\n';
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

    if (!initShaders(gl, vertexShaderSource, fragmentShaderSource)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    // 设置顶点信息
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // 获取uniform变量存储地址
    var u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
    var u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(program, 'u_NormalMatrix');
    var u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
    var u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
    var u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');
    if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight) { 
        console.log('Failed to get the storage location');
        return;
    }

    // 设置光的颜色（白色）
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // 设置光线方向
    gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);
    // 设置环境光颜色
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    var modelMatrix = new Matrix4();  // 模型矩阵
    var mvpMatrix = new Matrix4();    // 模型视图投影矩阵
    var normalMatrix = new Matrix4(); // 对法线进行变换

    // 计算模型矩阵
    modelMatrix.setRotate(90, 0, 1, 0); // 绕y轴旋转
    // 将模型矩阵传给u_ModelMatrix变量
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // 设置模型视图投影矩阵
    mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
    mvpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
    mvpMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // 根据模型矩阵计算用来变换法向量的矩阵 setInverseOf:求得模型矩阵的逆矩阵
    normalMatrix.setInverseOf(modelMatrix);
    // 矩阵转置
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}


function initVertexBuffers(gl) {
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    // 顶点列表
    var vertices = new Float32Array([
        2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 前
        2.0, 2.0, 2.0,   2.0,-2.0, 2.0,   2.0,-2.0,-2.0,   2.0, 2.0,-2.0, // v0-v3-v4-v5 右
        2.0, 2.0, 2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0, 2.0, 2.0, // v0-v5-v6-v1 上
        -2.0, 2.0, 2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0,-2.0, 2.0, // v1-v6-v7-v2 左
        -2.0,-2.0,-2.0,   2.0,-2.0,-2.0,   2.0,-2.0, 2.0,  -2.0,-2.0, 2.0, // v7-v4-v3-v2 下
        2.0,-2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0, 2.0,-2.0,   2.0, 2.0,-2.0  // v4-v7-v6-v5 后
    ]);

    // 颜色列表
    var colors = new Float32Array([
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 前
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 右
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 上
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 左
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 下
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 后
    ]);

    // 法向量列表
    var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 前
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 右
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 上
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 左
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 下
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 后
    ]);

    // 顶点索引
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // 前
        4, 5, 6,   4, 6, 7,    // 右
        8, 9,10,   8,10,11,    // 上
        12,13,14,  12,14,15,    // 左
        16,17,18,  16,18,19,    // 下
    20,21,22,  20,22,23     // 后
    ]);

    // 存入缓冲区
    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 将索引写入缓冲区
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
    }

    function initArrayBuffer(gl, attribute, data, num, type) {
        var buffer = gl.createBuffer();
        if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        var a_attribute = gl.getAttribLocation(program, attribute);
        if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
        }
        gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);

    return true;
}

  // 创建缓冲区
  function initArrayBuffer (gl, attribute, data, num, type) {
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
   
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a_attribute = gl.getAttribLocation(program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
  
    return true;
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