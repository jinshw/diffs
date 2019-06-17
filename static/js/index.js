const { ipcRenderer, remote } = require('electron')
const fs = require('fs');

const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
var menu = new Menu();
// menu.append(new MenuItem({ label: 'MenuItem1', click: function () { console.log('item 1 clicked'); } }));
// menu.append(new MenuItem({ type: 'separator' }));
// menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }));
window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    menu.popup(remote.getCurrentWindow());
}, false);
var template = [
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall'
            },
        ]
    },
    {
        label: '视图',
        submenu: [
            {
                label: '重新加载',
                accelerator: 'CmdOrCtrl+R',
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.reload();
                }
            },
            {
                label: '全屏切换',
                accelerator: (function () {
                    if (process.platform == 'darwin')
                        return 'Ctrl+Command+F';
                    else
                        return 'F11';
                })(),
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
            },
            {
                label: '开发者工具',
                accelerator: (function () {
                    if (process.platform == 'darwin')
                        return 'Alt+Command+I';
                    else
                        return 'F12';
                })(),
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.toggleDevTools();
                }
            },
        ]
    },
    {
        label: '窗口',
        role: 'window',
        submenu: [
            {
                label: '最小化',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize'
            },
            {
                label: '关闭',
                accelerator: 'CmdOrCtrl+W',
                role: 'close'
            },
        ]
    },
    {
        label: '帮助',
        role: 'help',
        submenu: [
            {
                label: '了解更多',
                click: function () { require('electron').shell.openExternal('http://www.chtgeo.cn/') }
            },
        ]
    },
];

if (process.platform == 'darwin') {
    var name = require('electron').remote.app.getName();
    template.unshift({
        label: name,
        submenu: [
            {
                label: 'About ' + name,
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                label: 'Services',
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                label: 'Hide ' + name,
                accelerator: 'Command+H',
                role: 'hide'
            },
            {
                label: 'Hide Others',
                accelerator: 'Command+Alt+H',
                role: 'hideothers'
            },
            {
                label: 'Show All',
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: function () { app.quit(); }
            },
        ]
    });
    // Window menu.
    template[3].submenu.push(
        {
            type: 'separator'
        },
        {
            label: 'Bring All to Front',
            role: 'front'
        }
    );
}

var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);







let leftXMLObject = null, rightXMLObject = null;
let xodrPath = "", xmlPath = "";
let leftSelect2 = [], rightSelect2 = [];
let rightFile = null;

// jquery初始化
$(document).ready(function () {
    document.title = "Diff - "

    $("#successAlertClose").click(function () {
        $("#successAlertId").css('display', 'none');
    })

    $("#leftFilterId").select2({
        data: [{ 'id': 0, 'text': "java" }, { 'id': 1, "text": "python" }],
        placeholder: "请选择",
        allowClear: true,
        width: "resolve"
    });

    $("#rightFilterId").select2({
        data: [{ 'id': 0, 'text': "java" }, { 'id': 1, "text": "python" }],
        placeholder: "请选择",
        allowClear: true,
        width: "resolve"
    });

    $("#leftFilterId").change(function () {
        var paramObj = $(this).select2("data")
        if (paramObj != null) {
            var paramId = paramObj.id
            var _data = []
            var options = []
            var select2Data = []

            let objectName = $("#objectName").val()
            let findStr = ""
            if (objectName == "ALL") {
                findStr = "object"
            } else {
                findStr = "object[name*='" + objectName + "']"
            }

            var runType = $("#runType").val()
            if (runType == "road") {
                $(leftXMLObject).find("road[id='" + paramId + "']").each(function () {
                    //获取
                    var id = $(this).attr("id");
                    var junction = $(this).attr("junction");
                    options.push(id);
                    select2Data.push({ id: id, text: id })
                    $(this).find(findStr).each(function () {
                        var objectId = $(this).attr("id")
                        var type = $(this).attr("type")
                        var name = $(this).attr("name")
                        var s = $(this).attr("s")
                        var t = $(this).attr("t")
                        var zOffset = $(this).attr("zOffset")
                        _data.push({ "id": id, "objectId": objectId, "type": type, "name": name, "s": s, "t": t, "zOffset": zOffset })
                    })

                })
            } else if (runType == "junction") {
                $(leftXMLObject).find("road[id='" + paramId + "'][junction != '-1']").each(function () {
                    //获取
                    var id = $(this).attr("id");
                    var junction = $(this).attr("junction");
                    options.push(id);
                    select2Data.push({ id: id, text: id })
                    $(this).find(findStr).each(function () {
                        var objectId = $(this).attr("id")
                        var type = $(this).attr("type")
                        var name = $(this).attr("name")
                        var s = $(this).attr("s")
                        var t = $(this).attr("t")
                        var zOffset = $(this).attr("zOffset")
                        _data.push({ "id": id, "objectId": objectId, "type": type, "name": name, "s": s, "t": t, "zOffset": zOffset })
                    })

                })
            }

            $("#leftTable").bootstrapTable('load', _data);
        } else {
            readXODR(xodrPath)
        }

    })

    $("#rightFilterId").change(function () {
        var paramObj = $(this).select2("data")
        if (paramObj != null) {
            var paramId = paramObj.id
            var _data = []
            var options = []
            var select2Data = []

            let objectName = $("#objectName").val()
            let findStr = ""
            if (objectName == "ALL") {
                findStr = "object"
            } else {
                findStr = "object[name*='" + objectName + "']"
            }

            var runType = $("#runType").val()
            if (runType == "road") {
                $(rightXMLObject).find("road[id='" + paramId + "']").each(function () {
                    //获取
                    var id = $(this).attr("id");
                    options.push(id);
                    select2Data.push({ id: id, text: id })
                    $(this).find(findStr).each(function () {
                        var objectId = $(this).attr("id")
                        var type = $(this).attr("type")
                        var name = $(this).attr("name")
                        var s = $(this).attr("s")
                        var t = $(this).attr("t")
                        var zOffset = $(this).attr("zOffset")
                        _data.push({ "id": id, "objectId": objectId, "type": type, "name": name, "s": s, "t": t, "zOffset": zOffset })
                    })

                })
            } else if (runType == "junction") {
                $(rightXMLObject).find("OpenDriveData").children("junction").children("links").children("link[id='" + paramId + "']").each(function () {
                    //获取
                    var id = $(this).attr("id");
                    options.push(id);
                    select2Data.push({ id: id, text: id })
                    $(this).find(findStr).each(function () {
                        var objectId = $(this).attr("id")
                        var type = $(this).attr("type")
                        var name = $(this).attr("name")
                        var s = $(this).attr("s")
                        var t = $(this).attr("t")
                        var zOffset = $(this).attr("zOffset")
                        _data.push({ "id": id, "objectId": objectId, "type": type, "name": name, "s": s, "t": t, "zOffset": zOffset })
                    })

                })
            }
            $("#rightTable").bootstrapTable('load', _data);
        } else {
            readXML(xmlPath)
        }

    })

    // 左侧文件打开
    $("#xodrFile").change(function () {
        var xodrFile = $("#xodrFile").val()
        var $file = $(this);
        var fileObj = $file[0];
        // let dataURL = null;
        if (fileObj && fileObj.files && fileObj.files[0]) {
            xodrPath = window.URL.createObjectURL(fileObj.files[0]);
        } else {
            xodrPath = $file.val();
        }

        readXODR(xodrPath)
    });

    // 右侧文件打开
    $("#xmlFile").change(function () {
        var xmlFile = $("#xmlFile").val()
        var $file = $(this);
        var fileObj = $file[0];
        if (fileObj && fileObj.files && fileObj.files[0]) {
            xmlPath = window.URL.createObjectURL(fileObj.files[0]);
        } else {
            xmlPath = $file.val();
        }
        readXML(xmlPath)
    });

    // 类型改变
    $("#objectName").change(function () {
        $("#leftFilterId").trigger("change")
        $("#rightFilterId").trigger("change")
    })

    // 左侧表格
    $('#leftTable').bootstrapTable({
        url: './static/js/data1.json',
        queryParams: "queryParams",
        toolbar: "#toolbar",
        sidePagination: "true",
        striped: true, // 是否显示行间隔色
        //search : "true",
        uniqueId: "ID",
        pageSize: "10",
        pageList: [10, 20, 50, 100, 500, 10000],
        pagination: true, // 是否分页
        sortable: true, // 是否启用排序
        columns: [{
            field: 'state',
            checkbox: true,
        }, {
            field: 'id',
            title: '道路ID'
        }, {
            field: 'objectId',
            title: '设施ID'
        },
        {
            field: 'type',
            title: 'type'
        },
        {
            field: 'name',
            title: 'name'
        },
        {
            field: 's',
            title: 's'
        },
        {
            field: 't',
            title: 't'
        },
        {
            field: 'zOffset',
            title: 'zOffset'
        },

        ]
    });

    // 右侧表格
    $('#rightTable').bootstrapTable({
        url: './static/js/data1.json',
        queryParams: "queryParams",
        toolbar: "#toolbar",
        sidePagination: "true",
        striped: true, // 是否显示行间隔色
        //search : "true",
        uniqueId: "ID",
        pageSize: "10",
        pageList: [10, 20, 50, 100, 500, 10000],
        pagination: true, // 是否分页
        sortable: true, // 是否启用排序
        columns: [{
            field: 'state',
            checkbox: true,
        }, {
            field: 'id',
            title: '道路ID'
        }, {
            field: 'objectId',
            title: '设施ID'
        },
        {
            field: 'type',
            title: 'type'
        },
        {
            field: 'name',
            title: 'name'
        },
        {
            field: 's',
            title: 's'
        },
        {
            field: 't',
            title: 't'
        },
        {
            field: 'zOffset',
            title: 'zOffset'
        },

        ]
    });

})

//监听与主进程的通信
ipcRenderer.on('action', (event, arg) => {
    switch (arg) {
        case '新建文件': //新建文件
            break;
        case '打开文件': //打开文件
            break;
        case '保存': //保存文件
            break;
        case '退出':
            ipcRenderer.sendSync('reqaction', 'exit');
            break;
    }
});

// 读取xodr文件
function readXODR(filepath) {
    if (filepath == "" || filepath == null) {
        alert("请选中一个文件")
        return;
    }

    var runType = $("#runType").val()
    if (runType == "road") {
        readXODRByRoad(filepath)
    } else if (runType == "junction") {
        readXODRByJunction(filepath)
    }
}

function readXODRByRoad(filepath) {
    $.ajax({
        type: "get",
        dataType: "xml",
        url: filepath,
        success: function (xmlData) {
            leftXMLObject = xmlData;
            var _data = []
            var options = []
            leftSelect2 = []
            let objectName = $("#objectName").val()
            let findStr = ""
            if (objectName == "ALL") {
                findStr = "object"
            } else {
                findStr = "object[name*='" + objectName + "']"
            }

            $(xmlData).find("road").each(function () {
                //获取
                var id = $(this).attr("id");
                options.push(id);
                leftSelect2.push({ id: id, text: id })
                // $(this).find("object").each(function () {
                $(this).find(findStr).each(function () {
                    var objectId = $(this).attr("id")
                    var type = $(this).attr("type")
                    var name = $(this).attr("name")
                    var s = $(this).attr("s")
                    var t = $(this).attr("t")
                    var zOffset = $(this).attr("zOffset")
                    _data.push({ "id": id, "objectId": objectId, "type": type, "name": name, "s": s, "t": t, "zOffset": zOffset })
                })

            })
            $("#leftTable").bootstrapTable('load', _data);
            setSelect2("leftFilterId", leftSelect2)
        },
        error: function (xhr, status, error) {
            console.log(error)
        }
    })
}

function readXODRByJunction(filepath) {
    $.ajax({
        type: "get",
        dataType: "xml",
        url: filepath,
        success: function (xmlData) {
            leftXMLObject = xmlData;
            var _data = []
            var options = []
            leftSelect2 = []

            let objectName = $("#objectName").val()
            let findStr = ""
            if (objectName == "ALL") {
                findStr = "object"
            } else {
                findStr = "object[name*='" + objectName + "']"
            }
            $(xmlData).find("road[junction != '-1']").each(function () {
                //获取
                var id = $(this).attr("id");
                options.push(id);
                leftSelect2.push({ id: id, text: id })
                $(this).find(findStr).each(function () {
                    var objectId = $(this).attr("id")
                    var type = $(this).attr("type")
                    var name = $(this).attr("name")
                    var s = $(this).attr("s")
                    var t = $(this).attr("t")
                    var zOffset = $(this).attr("zOffset")
                    _data.push({ "id": id, "objectId": objectId, "type": type, "name": name, "s": s, "t": t, "zOffset": zOffset })
                })

            })
            $("#leftTable").bootstrapTable('load', _data);
            setSelect2("leftFilterId", leftSelect2)
        },
        error: function (xhr, status, error) {
            console.log(error)
        }
    })
}


// 读取xml文件
function readXML(filepath) {
    if (filepath == "" || filepath == null) {
        alert("请选中一个文件")
        return;
    }

    var runType = $("#runType").val()
    if (runType == "road") {
        readXMLByRoad(filepath)
    } else if (runType == "junction") {
        readXMLByJunction(filepath)
    }

}

function readXMLByRoad(filepath) {
    $.ajax({
        type: "get",
        dataType: "xml",
        url: filepath,
        success: function (xmlData) {
            rightXMLObject = xmlData;
            var _data = []
            var options = []
            rightSelect2 = []

            let objectName = $("#objectName").val()
            let findStr = ""
            if (objectName == "ALL") {
                findStr = "object"
            } else {
                findStr = "object[name*='" + objectName + "']"
            }
            $(xmlData).find("road").each(function () {
                //获取
                var id = $(this).attr("id");
                options.push(id);
                rightSelect2.push({ id: id, text: id })
                $(this).find(findStr).each(function () {
                    var objectId = $(this).attr("id")
                    var type = $(this).attr("type")
                    var name = $(this).attr("name")
                    var s = $(this).attr("s")
                    var t = $(this).attr("t")
                    var zOffset = $(this).attr("zOffset")
                    _data.push({ "id": id, "objectId": objectId, "type": type, "name": name, "s": s, "t": t, "zOffset": zOffset })
                })

            })
            $("#rightTable").bootstrapTable('load', _data);
            setSelect2("rightFilterId", rightSelect2)
        },
        error: function (xhr, status, error) {
            console.log(error)
        }
    })
}

function readXMLByJunction(filepath) {
    $.ajax({
        type: "get",
        dataType: "xml",
        url: filepath,
        success: function (xmlData) {
            rightXMLObject = xmlData;
            var _data = []
            var options = []
            rightSelect2 = []

            let objectName = $("#objectName").val()
            let findStr = ""
            if (objectName == "ALL") {
                findStr = "object"
            } else {
                findStr = "object[name*='" + objectName + "']"
            }
            $(xmlData).find("OpenDriveData").children("junction").children("links").children("link").each(function () {
                //获取
                var id = $(this).attr("id");
                options.push(id);
                rightSelect2.push({ id: id, text: id })
                $(this).find(findStr).each(function () {
                    var objectId = $(this).attr("id")
                    var type = $(this).attr("type")
                    var name = $(this).attr("name")
                    var s = $(this).attr("s")
                    var t = $(this).attr("t")
                    var zOffset = $(this).attr("zOffset")
                    _data.push({ "id": id, "objectId": objectId, "type": type, "name": name, "s": s, "t": t, "zOffset": zOffset })
                })

            })
            $("#rightTable").bootstrapTable('load', _data);
            setSelect2("rightFilterId", rightSelect2)
        },
        error: function (xhr, status, error) {
            console.log(error)
        }
    })
}

//操作栏的格式化
function actionFormatter(value, row, index) {
    var id = value;
    var result = "";
    result += "<a href='javascript:;' class='btn btn-xs green' onclick=\"EditViewById('" + id + "', view='view')\" title='查看'><span class='glyphicon glyphicon-search'></span></a>";
    result += "<a href='javascript:;' class='btn btn-xs blue' onclick=\"EditViewById('" + id + "')\" title='编辑'><span class='glyphicon glyphicon-pencil'></span></a>";
    result += "<a href='javascript:;' class='btn btn-xs red' onclick=\"DeleteByIds('" + id + "')\" title='删除'><span class='glyphicon glyphicon-remove'></span></a>";
    return result;
}

$("#deleteBT").click(function () {
    let selectedDatas = $("#rightTable").bootstrapTable("getSelections")
    if (selectedDatas.length == 0) {
        alert("请选择数据")
    } else {
        $("#deleteModal").modal('show')
    }

})

$("#deleteDatasId").click(function () {
    $("#deleteModal").modal('hide')
    let selectedDatas = $("#rightTable").bootstrapTable("getSelections")

    let runType = $("#runType").val()
    if (runType == "road") {
        selectedDatas.forEach(function (item) {
            $(rightXMLObject).find("road[id='" + item.id + "']").children("objects").children("object[id='" + item.objectId + "'][type='" + item.type + "'][name='" + item.name + "']").each(function () {
                $(this).remove();
            })
        })
    } else if (runType == "junction") {
        selectedDatas.forEach(function (item) {
            $(rightXMLObject).find("OpenDriveData").children("junction").children("links").children("link[id='" + item.id + "']").children("objects").children("object[id='" + item.objectId + "'][type='" + item.type + "'][name='" + item.name + "']").each(function () {
                $(this).remove();
            })
        })
    }
    saveRightXML()
})

//保存当前文档
function saveCurrentDoc(txtSave, currentFile) {
    if (!currentFile) {
        const file = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
            filters: [
                { name: "Text Files", extensions: ['xml', 'js', 'html', 'md'] },
                { name: 'All Files', extensions: ['*'] }]
        });
        if (file) currentFile = file;
    }
    if (currentFile) {
        // const txtSave = $("#xodrFile").val();
        saveText(txtSave, currentFile);
        document.title = "Diff - " + currentFile;
    }
}

//保存文本内容到文件
function saveText(text, file) {
    fs.writeFileSync(file, text);
}

//xml转换为string  
function xmlToString(xmlDoc) {
    // if (window.ActiveXObject) {  
    //     return xmlDoc.xml;  //IE     
    // } else {  
    //     return (new XMLSerializer()).serializeToString(xmlDoc);  //FF     
    // }  
    // electron 使用的是Chrome内核
    return (new XMLSerializer()).serializeToString(xmlDoc);
}

function setSelect2(id, data) {
    $("#" + id).select2({
        data: data,
        placeholder: "请选择",
        allowClear: true,
        width: "resolve"
    });
}

// --------------- 文件对比--------------------//


$("#runBT").click(function () {
    // $("#maskLayer").show()
    let difftype = $("input[name='difftype']:checked").val()
    let runType = $("#runType").val()
    if (runType == "road") {
        runEvent(difftype)
    } else if (runType == "junction") {
        runEventJunction(difftype)
    }

})

function runEvent(type) {
    if (type == "replaceAdd") {
        replaceAdd()
    } else if (type == "replaceAll") {
        replaceAll()
    } else if (type == "interfaceReplaceAdd") {

    }
    // $("#maskLayer").hide()
}

function runEventJunction(type) {
    if (type == "replaceAdd") {
        replaceAddJunction()
    } else if (type == "replaceAll") {
        replaceAllJunction()
    } else if (type == "interfaceReplaceAdd") {

    }
    // $("#maskLayer").hide()
}

// 替换和新增(路)
function replaceAdd() {
    let selectedDatas = $("#leftTable").bootstrapTable("getSelections")
    if (selectedDatas.length == 0) {
        alert("请选择数据")
        return;
    }

    selectedDatas.forEach(function (item) {
        replaceAddXMLNode(item)
    })

    saveRightXML()
}
// 替换和新增(路口)
function replaceAddJunction() {
    let selectedDatas = $("#leftTable").bootstrapTable("getSelections")
    if (selectedDatas.length == 0) {
        alert("请选择数据")
        return;
    }

    selectedDatas.forEach(function (item) {
        replaceAddXMLNodeJunction(item)
    })
    saveRightXML()
}

function replaceAddXMLNode(item) {
    // 查询右侧xml中id的road
    let road = $(rightXMLObject).find("road[id='" + item.id + "']")
    // 如果右侧road不存在，新增road节点
    if (road.length == 0) {
        let objectsLeft = $(leftXMLObject).find("road[id='" + item.id + "']").children("objects")
        let $newroad = $('<road id="' + item.id + '" name="" pretype="junction" pre="" suctype="" suc="" leftcurve="" rightcurve=""></road>')
        $newroad.append(objectsLeft.prop("outerHTML"))
        $(rightXMLObject).find("OpenDriveData").append($newroad.prop("outerHTML"))
    } else {
        // 如果右侧objects不存在，新增objects节点
        let objectsRight = $(rightXMLObject).find("road[id='" + item.id + "']").children("objects")
        if (objectsRight.length == 0) {
            let objectsLeft = $(leftXMLObject).find("road[id='" + item.id + "']").children("objects")
            $(rightXMLObject).find("road[id='" + item.id + "']").append(objectsLeft.prop("outerHTML"))
        } else {
            // 查询右侧是否存在item对应的object
            let objectList = getRightObjectListByST(item)
            let objectLeft = $(leftXMLObject).find("road[id='" + item.id + "']").children("objects").children("object[id='" + item.objectId + "']")
            // 如果右侧存在，替换object
            if (objectList.length > 0) {
                objectList.forEach(function (v, i) {
                    $(v).remove()
                })
            }
            $(rightXMLObject).find("road[id='" + item.id + "']").children("objects").append(objectLeft.prop("outerHTML"))
        }
    }
}

function replaceAddXMLNodeJunction(item) {
    // 查询右侧xml中id的road
    let link = $(rightXMLObject).find("junction").children("links").children("link[id='" + item.id + "']")
    // 如果右侧road不存在，新增road节点
    if (link.length == 0) {
        // let objectsLeft = $(leftXMLObject).find("road[id='" + item.id + "']").children("objects")
        // let $newroad = $('<link type="st" fromroad="" toroad="" id="'+ item.id +'" name="" lansfrom="" lansto="" s="0" lansmark="" hidepavement="">')
        // $newroad.append(objectsLeft.prop("outerHTML"))
        // $(rightXMLObject).find("OpenDriveData").append($newroad.prop("outerHTML"))
    } else {
        // 如果右侧objects不存在，新增objects节点
        let objectsRight = $(rightXMLObject).find("junction").children("links").children("link[id='" + item.id + "']").children("objects")
        if (objectsRight.length == 0) {
            let objectsLeft = $(leftXMLObject).find("road[id='" + item.id + "']").children("objects")
            $(rightXMLObject).find("junction").children("links").children("link[id='" + item.id + "']").append(objectsLeft.prop("outerHTML"))
        } else {
            // 查询右侧是否存在item对应的object
            let objectList = getRightObjectListByST(item)
            let objectLeft = $(leftXMLObject).find("road[id='" + item.id + "']").children("objects").children("object[id='" + item.objectId + "']")
            // 如果右侧存在，替换object
            if (objectList.length > 0) {
                objectList.forEach(function (v, i) {
                    $(v).remove()
                })
            }
            $(rightXMLObject).find("OpenDriveData").children("junction").children("links").children("link[id='" + item.id + "']").children("objects").append(objectLeft.prop("outerHTML"))
        }
    }
}

function getRightObjectListByST(item) {
    let resultList = []
    let step = 0.01
    let s = new Number(item.s)
    let t = new Number(item.t)
    let sStart = s - step, sEnd = s + step;
    let tStart = t - step, tEnd = t + step;
    // 根据object节点的type,name,s,t(在+-0.01范围内)，查询 
    let objectRight = null;
    let runType = $("#runType").val()
    if (runType == "road") {
        objectRight = $(rightXMLObject).find("road[id='" + item.id + "']").children("objects").children("object[type='" + item.type + "'][name='" + item.name + "']")
    } else if (runType == "junction") {
        objectRight = $(rightXMLObject).find("OpenDriveData").children("junction").children("links").children("link[id='" + item.id + "']").children("objects").children("object[type='" + item.type + "'][name='" + item.name + "']")
    }

    objectRight.each(function () {
        let sRight = $(this).attr("s")
        let tRight = $(this).attr("t")
        let sNum = new Number(sRight)
        let tNum = new Number(tRight)
        if ((sNum >= sStart && sNum <= sEnd) && (tNum >= tStart && tNum <= tEnd)) {
            resultList.push($(this))
        }

    })
    return resultList;
}

// 替换全部数据
function replaceAll() {
    if (leftSelect2.length == 0) {
        alert("没有数据")
        return;
    }

    leftSelect2.forEach(function (item) {
        replaceAllXMLNode(item.id)
    })

    saveRightXML()
}
// 替换全部数据(路口)
function replaceAllJunction() {
    if (leftSelect2.length == 0) {
        alert("没有数据")
        return;
    }

    leftSelect2.forEach(function (item) {
        replaceAllXMLNodeJunction(item.id)
    })

    saveRightXML()
}

function replaceAllXMLNode(id) {
    // 查询出左侧xml中road[id=id]的objects所有节点
    let objectsLeft = $(leftXMLObject).find("road[id='" + id + "']").children("objects")
    // 判断右侧xml中是否有该id的road
    var rightRoads = $(rightXMLObject).find("road[id='" + id + "']")
    if (rightRoads.length == 0) {//右侧没有该road,则新增road 
        // if(id=="2022"){
        //     debugger;
        // }
        let $newroad = $('<road id="' + id + '" name="" pretype="" pre="" suctype="" suc="" leftcurve="" rightcurve=""></road>')
        $newroad.append(objectsLeft.prop("outerHTML"))
        $(rightXMLObject).find("OpenDriveData").append($newroad.prop("outerHTML"))
    } else {//右侧有该road，替换road下边的objects

        // 删除右侧road下所有objects节点
        let objectsRight = $(rightXMLObject).find("road[id='" + id + "']").children("objects")[0]
        if (objectsRight == 'undefined' || objectsRight == null) {//right 没有该id的road
            let $newroad = $('<road id="' + id + '" name="" pretype="junction" pre="19001" suctype="junction" suc="19004" leftcurve="18003,grass" rightcurve="17022,spec_concrete_3d"></road>')
            $newroad.append(objectsLeft.prop("outerHTML"))
            $(rightXMLObject).find("OpenDriveData").append($newroad.prop("outerHTML"))
        } else {// right 有该id的road 
            objectsRight.remove()
            $(rightXMLObject).find("road[id='" + id + "']").append(objectsLeft.prop("outerHTML"))
        }



    }
}

function replaceAllXMLNodeJunction(id) {
    // 查询出左侧xml中road[id=id]的objects所有节点
    let objectsLeft = $(leftXMLObject).find("road[id='" + id + "']").children("objects")
    // 判断右侧xml中是否有该id的road
    var rightRoads = $(rightXMLObject).find("OpenDriveData").children("junction").children("links").children("link[id='" + id + "']")
    if (rightRoads.length == 0) {//右侧没有该road,则新增road 
        // let $newroad = $('<road id="' + id + '" name="" pretype="" pre="" suctype="" suc="" leftcurve="" rightcurve=""></road>')
        // $newroad.append(objectsLeft.prop("outerHTML"))
        // $(rightXMLObject).find("OpenDriveData").append($newroad.prop("outerHTML"))
    } else {//右侧有该road，替换road下边的objects

        // 删除右侧road下所有objects节点
        // let objectsRight = $(rightXMLObject).find("road[id='" + id + "']").children("objects")[0]
        let objectsRight = $(rightXMLObject).find("OpenDriveData").children("junction").children("links").children("link[id='" + id + "']").children("objects")[0]

        if (objectsRight == 'undefined' || objectsRight == null) {//right 没有该id的road
            // let $newroad = $('<link type="" fromroad="" toroad="" id="'+id+'" name="" lansfrom="" lansto="" s="" lansmark="" hidepavement="">')
            // $newroad.append(objectsLeft.prop("outerHTML"))
            // $(rightXMLObject).find("OpenDriveData").append($newroad.prop("outerHTML"))
        } else {// right 有该id的road 
            objectsRight.remove()
            $(rightXMLObject).find("OpenDriveData").children("junction").children("links").children("link[id='" + id + "']").append(objectsLeft.prop("outerHTML"))
        }
    }
}

// 保存右侧XML文件
function saveRightXML() {

    if (!rightFile) {
        const file = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
            filters: [
                { name: "Text Files", extensions: ['xml', 'js', 'html', 'md'] },
                { name: 'All Files', extensions: ['*'] }]
        });
        if (file) rightFile = file;
    }
    if (rightFile) {
        saveCurrentDoc(xmlToString(rightXMLObject), rightFile)
        // $("#successAlertId").css('display','block'); 
        alert("执行成功！")
        // readXML(xmlPath)
        $("#rightFilterId").trigger("change")
    }
}
















