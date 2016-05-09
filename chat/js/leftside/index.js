function LeftSide(node,core,window) {
    var template = require('./template.js');
    var loadFile = require('../util/load.js')();
    var Item = require('./chatItem.js');
    var $node;
    var Alert = require('../util/modal/alert.js');
    var global;
    var USOURCE = ['laptop','','','','mobile'];
    var chatItemList = {};
    var parseDOM = function() {
        $node = $(node);
    };

    var newUserMessage = function(data) {
        var _html = doT.template(template.listItem)(data);
        var li = $(_html);
        $(node).find(".js-users-list").append(li);
    };
    var onReceive = function(value,data) {
        switch(data.type) {
            case 102:
                newUserMessage(data);
                break;
        }
    };

    var getDefaultChatList = function() {
        $.ajax({
            'url' : '/chat/admin/getAdminChats.action',
            'dataType' : 'json',
            'type' : 'get',
            'data' : {
                'uid' : global.id
            }
        }).success(function(ret) {
            if(ret.userList.length > 0) {
                loadFile.load(global.baseUrl + 'views/leftside/chatlist.html').then(function(value) {
                    for(var i = 0,
                        len = ret.userList.length;i < len;i++) {
                        var item = ret.userList[i];
                        item.source_type = USOURCE[item.usource];
                    }
                    var _html = doT.template(value)({
                        'list' : ret.userList
                    });
                    $(node).find(".js-users-list").html(_html);
                    for(var i = 0,
                        len = ret.userList.length;i < len;i++) {
                        var item = ret.userList[i];
                        chatItemList[item.cid] = new Item(item,core,node);
                    }
                    setTimeout(function() {
                        var count = 0;
                        for(var el in chatItemList) {
                            if(count > 0)
                                break;
                            count++;
                            chatItemList[el].onOffLine();
                        }
                    },1000);
                });
            } else {
                var height = $(node).outerHeight();
                $(node).find(".js-chatonline").addClass("noOnline");
            }
        });
    };

    var removeBtnClickHandler = function(e) {
        var elm = e.currentTarget;
        var cid = $(elm).attr("data-cid");
        var dialog = new Alert({
            'title' : '提示',
            'text' : '是否确认删除这个用户？',
            'OK' : function() {
                chatItemList[cid].onRemove();
            }
        });
        dialog.show();
    };
    var onloadHandler = function(evt,data) {
        global = core.getGlobal();
        $(node).find("img.js-my-logo").attr("src",data.face);
        $(node).find(".js-customer-service").html(data.name);
        getDefaultChatList();
    };

    var bindLitener = function() {
        $(document.body).on("core.onload",onloadHandler);
        $(document.body).on("core.receive",onReceive);
        $node.delegate(".js-remove",'click',removeBtnClickHandler);
    };

    var initPlugsin = function() {

    };

    var init = function() {
        parseDOM();
        bindLitener();
        initPlugsin();
    };

    init();

};

module.exports = LeftSide;
