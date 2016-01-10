﻿function Repository(name, statMins) {
    this.URL = appRoot + "api/repositories/";
    this.name = name;
    if (statMins) {
        this.statMins = statMins;
    }
    this.state = AjaxState.Init;
    //this.refresh();
}

Repository.prototype = {
    refresh: function () {
        var that = this;
        this.state = AjaxState.Loading;
        $.ajax({
            url: this.URL + this.name + (this.statMins ? ("?statMins=" + this.statMins) : "")
        }).done(function (data) {
            that.name = data.name;
            that.stat = data.stat;
            that.state = AjaxState.Ready;
            $(that).dequeue("update" + that.name);
        }).fail(function () {
            that.state = AjaxState.Fail;
        })
    },
    update: function (container, templateObj) {
        //if (this.state == AjaxState.Init || this.state)
        this.refresh();
        var update = function (data) {
            var template = templateObj.html();
            Mustache.parse(template);
            var html = Mustache.render(template, data);
            container.html(html);
        }.bind(this);

        // display a default view first.
        update({
            appRoot: appRoot,
            name: this.name,
            stat: {
                all: "...",
                trace: "...",
                debug: "...",
                info: "...",
                warn: "...",
                error: "...",
                fatal: "...",
            }
        });
        
        if (this.state == AjaxState.Ready) {
            update({
                appRoot: appRoot,
                name: this.name,
                stat: this.stat
            });
        } else if (this.state == AjaxState.Loading) {
            $(this).queue("update" + this.name, function (next) {
                update({
                    appRoot: appRoot,
                    name: this.name,
                    stat: this.stat
                });
                next();
            }.bind(this));
        } else if (this.state == AjaxState.Fail) {
            update({
                appRoot: appRoot,
                name: this.name,
                stat: {
                    all: "loading failed",
                    trace: "loading failed",
                    debug: "loading failed",
                    info: "loading failed",
                    warn: "loading failed",
                    error: "loading failed",
                    fatal: "loading failed",
                }
            });
        }
    }
};

function RepositoryDetail(name, filter) {
    // filter: level, beginAt, endAt, machineName, keyword, pageSize
    this.name = name;
    var conditions = [];
    for (key in filter) {
        var value = filter[key];
        if (value) {
            conditions.push("key=" + value);
        }
    }
    var query = conditions.join("&");
    this.url = appRoot + "api/repositories/" + name + "/entries?" + query;
    this.state = AjaxState.Init;
}

RepositoryDetail.prototype = {
    refresh: function() {
        var that = this;
        this.state = AjaxState.Loading;
        $.ajax({
            url: this.url
        }).done(function (data) {
            $(that).dequeue("update" + that.name);
        }).fail(function () {
            that.state = AjaxState.Fail;
        })
    },
    update: function (container, templateObj) {

    }
}

var AjaxState = {
    Init: "Init",
    Loading: "Loading",
    Ready: "Ready",
    Fail: "Fail"
};