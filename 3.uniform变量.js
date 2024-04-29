// 顶点着色器程序
var vertexShaderSource =
    'attribute vec4 a_Position;\n' + // attribute变量
    'void main() {\n' +
    ' gl_Position = a_Position;\n' + 
    ' gl_PointSize = 10.0;\n' +
    '}\n';
// 片元着色器程序
var fragmentShaderSource =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' + // uniform变量
    'void main() {\n' +
    ' gl_FragColor = u_FragColor;\n' + 
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

    // 获取attribute变量的存储位置
    var a_Position = gl.getAttribLocation(program, 'a_Position');
    
    // 获取u_FragColor变量的存储位置
    var u_FragColor = gl.getUniformLocation(program, 'u_FragColor');
    canvas.onmousedown = function (ev) {
        click(ev, gl, canvas, a_Position,u_FragColor);
    }
    // 设置<canvas>的背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 清空<canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];
var g_colors = [];
function click(ev, gl, canvas, a_Position,u_FragColor) {
    var x = ev.clientX; // 鼠标点击处的x坐标
    var y = ev.clientY; // 鼠标点击处的y坐标
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
    g_points.push([x,y]);

    // 将点的颜色存储到g_colors数组中
    if (x >= 0.0 && y >= 0.0) { // 第一象限
        g_colors.push([1.0, 0.0, 0.0, 1.0]);// 红色
    } else if (x < 0.0 && y < 0.0) { // 第三象限
        g_colors.push([0.0, 1.0, 0.0, 1.0]); // 绿色
    } else {
        g_colors.push([1.0, 1.0, 1.0, 1.0]);// 白色
    }
    // 清除<canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for (var i = 0; i < len; i++){
        var xy = g_points[i];
        var rgba = g_colors[i];
        // 将点的位置传递到变量中a_Position
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // 将点的颜色传输到u_FragColor变量中
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // 绘制点
        gl.drawArrays(gl.POINTS, 0, 1);
    }
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