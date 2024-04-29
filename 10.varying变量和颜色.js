// 顶点着色器程序
var vertexShaderSource =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' + // varying变量
    'void main() {\n' +
    ' gl_Position = a_Position;\n' +
    ' gl_PointSize = 10.0;\n' +
    ' v_Color = a_Color;\n' + // 将数据传给片元着色器
    '}\n';
// 片元着色器程序
var fragmentShaderSource =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    ' gl_FragColor = v_Color;\n' + //设置颜色
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
    // 清空<canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, n);
    // gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers() {
    var verticesColors = new Float32Array([
        0.0, 0.5, 1.0, 0.0, 0.0,
        -0.5, -0.5, 0.0, 1.0, 0.0,
        0.5, -0.5, 0.0, 0.0, 1.0,
    ])
    var n = 3; // 点的个数

    // 创建缓冲区对象
    var vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    // 向缓冲区对象中写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    // 获取a_Position的存储位置，分配缓冲区并开启
    var a_Position = gl.getAttribLocation(program, 'a_Position');
    // 将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*5, 0);
    // 连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position)

    // 获取a_Color的存储位置，分配缓冲区并开启
    var a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    gl.enableVertexAttribArray(a_Color); //开启缓冲区分配
    return n;
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