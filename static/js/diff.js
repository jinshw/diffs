
$("#runBT").click(function () {
    let difftype = $("input[name='difftype']:checked").val()
    console.log(difftype)
    runEvent(difftype)
})

function runEvent(type) {
    if (type == "replaceAdd") {

    } else if (type == "replaceAll") {
        replaceAll()
    } else if (type == "interfaceReplaceAdd") {

    }
}

function replaceAll(){
    if (leftSelect2.length == 0) {
        alert("没有数据")
        return ;
    }

    leftSelect2.forEach(function(item){

    })
}


function replaceAllXMLNode(id){
    // 判断右侧xml中是否有该id的road
    

    // 删除右侧road下所有objects节点

    // 查询出左侧xml中road[id=id]的objects所有节点

    // 把左侧objects节点插入右侧对应的road中

    // 保存右侧文件


}












