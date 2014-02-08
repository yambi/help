var R;// Raphael field
var L;// Raphael lines
var vs;//頂点集合
var es;//枝集合
var p;//Z_p
var radius=15;//点の半径
var forward_edges;//各点から出ていく枝集合
var backward_edges;//各点に入る枝集合
var paths;//枝
var labels;//枝ラベル
var circles;//頂点
var step;
var s;
var t;
var editable = true;

function load(file){
    $.getJSON(file , function(data) {
        p=parseInt(data.p);
        s=parseInt(data.s);
        if(isNaN(s))s=0;
        t=parseInt(data.t);
        if(isNaN(t))t=1;
        vs=new Array();
        forward_edges=new Array();
        backward_edges=new Array();
        var i=0;
        $.each(data.V,function(){
            vs.push({
                x: this.x,
                y: this.y,
                reachable: -1
            });
            forward_edges.push(new Array());
            backward_edges.push(new Array());
            i++;
        });
        es=new Array();
        i=0;
        $.each(data.E,function(){
            es.push({
                head: this.head,
                tail: this.tail,
                label: parseInt(this.label),
                initial_label: parseInt(this.label)
            });
            forward_edges[this.tail].push(i);
            backward_edges[this.head].push(i);
            i++;
        });
        draw();
    });
}

function draw(){
    //draw edges
    paths = new Array();
    labels = new Array();
    for(var i=0;i<es.length;++i){
        var x1 = vs[es[i].tail].x;
        var y1 = vs[es[i].tail].y;
        var x2 = vs[es[i].head].x;
        var y2 = vs[es[i].head].y;
        var d = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));

        var e = R.path([
            'M', x1+(x2-x1)*radius/d,y1+(y2-y1)*radius/d,
            'L', x2+(x1-x2)*radius/d,y2+(y1-y2)*radius/d
        ]).attr({
            'stroke-width': 5,
            'stroke': Raphael.hsb(1.0/p*es[i].label, 1, 0.8),
            //'arrow-start': 'oval-narrow-short'       
        });
        if(p>2)e.attr("arrow-end", 'block-midium-midium');
        paths.push(e);
        var h = 10;
        var l = R.text((x1+x2)/2.0+(y2-y1)/d*h,(y1+y2)/2.0+(x1-x2)/d*h,es[i].label).attr({"font": '18px Fontin-Sans, Arial', stroke: "none", fill: Raphael.hsb(1.0/p*es[i].label, 1, 0.8)});
        labels.push(l);
    }
    //draw vertices
    circles = new Array();
    for(var i=0;i<vs.length;++i){
        var v = R.circle(vs[i].x,vs[i].y,radius);
        v.attr("stroke","#000");
        v.id=i;
        if(i==s || i==t){
            v.attr("fill","#f00");
        }
        else{
            v.attr("fill",(vs[i].reachable>=0)?"#f00":"#fa0");
            v.attr("fill-opacity", 0.3);
            v.attr("cursor", "hand");
            v.click(change);
            v.mouseover(function(){this.animate({"fill-opacity": 1.0}, 300);})
            v.mouseout(function(){this.animate({"fill-opacity": 0.3}, 300);});
        }
        circles.push(v);
    }

    R.text(vs[s].x,vs[s].y,"s").attr({"font": '18px Fontin-Sans, Arial', stroke: "none", fill: "#000"});
    R.text(vs[t].x,vs[t].y,"t").attr({"font": '18px Fontin-Sans, Arial', stroke: "none", fill: "#000"});

    //lines
    L.text(20,15,"lines").attr({"font": '14px Fontin-Sans, Arial', stroke: "none", fill: "#000"});
    for(var i=0;i<p;++i){
        L.text(10,40+30*i,i).attr({"font": '12px Fontin-Sans, Arial', stroke: "none", fill: "#000"});
        L.path([
            'M', 20,40+30*i,
            'L', 90,40+30*i
        ]).attr({
            'stroke-width': 5,
            'stroke': Raphael.hsb(1.0/p*i, 1, 0.8),
            //'arrow-start': 'oval-narrow-short'       
        });        
    }
    redraw();
}
function redraw(){
    check();
    for(var i=0;i<es.length;++i){
        //paths[i].attr("stroke",Raphael.hsb(1.0/p*es[i].label, 1, 0.8));
        paths[i].animate({"stroke":Raphael.hsb(1.0/p*es[i].label, 1, 0.8)},200);
        labels[i].attr({"text":es[i].label});
        labels[i].animate({"fill":Raphael.hsb(1.0/p*es[i].label, 1, 0.8)},200);
    }
    for(var i=0;i<vs.length;++i){
        if(i==s || i==t){}
        //else circles[i].attr("fill",(vs[i].reachable>=0)?"#f00":"#fa0");
        else circles[i].animate({"fill":(vs[i].reachable>=0)?"#f00":"#fa0"},200);
    }
    $("#step").text(step);
}

function change(){
    console.log(this.id);
    if(!editable)return;
    var c = circles[this.id];
    c.animate({r: radius+5}, 200);
    setTimeout(function(){c.animate({r: radius}, 200);},200);

    for(var i=0;i<forward_edges[this.id].length;++i){
        es[forward_edges[this.id][i]].label=(es[forward_edges[this.id][i]].label+1)%p;
    }
    for(var i=0;i<backward_edges[this.id].length;++i){
        es[backward_edges[this.id][i]].label=(es[backward_edges[this.id][i]].label+p-1)%p;
    }
    step++;
    redraw();
}
function celebrate(v){
    var prev = vs[v].reachable;
    circles[v].animate({r: radius+10}, 200);
    setTimeout(function(){circles[v].animate({r: radius}, 400);},200);
    if(v==prev){
        editable=true;
        return;
    }
    setTimeout(celebrate,100,prev);
}
function check(){
    for(var i=0;i<vs.length;++i){
        vs[i].reachable=-1;
    }
    var stack = new Array();
    stack.push(s);
    stack.push(t);
    vs[t].reachable=t;

    $("#info").text("");
    while(stack.length>0){
        var v = stack.pop();
        if(v==s && vs[s].reachable>=0 && stack.length==0){
            $("#info").text("You win!");
            celebrate(s);
            //alert("You win!");
        }
        if(v==s && vs[s].reachable<0){
            vs[s].reachable=s;
        }
        for(var j=0;j<forward_edges[v].length;++j){
            if(es[forward_edges[v][j]].label==0 && vs[es[forward_edges[v][j]].head].reachable<0){
                vs[es[forward_edges[v][j]].head].reachable=v;
                stack.push(es[forward_edges[v][j]].head);
            }
        }
        for(var j=0;j<backward_edges[v].length;++j){
            if(es[backward_edges[v][j]].label==0 && vs[es[backward_edges[v][j]].tail].reachable<0){
                vs[es[backward_edges[v][j]].tail].reachable=v;
                stack.push(es[backward_edges[v][j]].tail);
            }
        }
    }
}
function reset(){
    for(var i=0;i<es.length;++i){
        es[i].label=es[i].initial_label;
    }
    step=0;
    redraw();
}
function save(){
    var svgString = R.toSVG();
    var a = document.createElement('a');
    a.download = document.location.search.substring(1)+".svg";
    a.type = 'image/svg+xml';
    var blob = new Blob([svgString], {"type":"image/svg+xml"});
    a.href = (window.URL || webkitURL).createObjectURL(blob);
    a.click();
}
