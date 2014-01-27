var R;// Raphael field
var L;// Raphael lines
var vs;//頂点集合
var es;//枝集合
var p;//Z_p
var radius=15;//点の半径
var forward_edges;//各点から出ていく枝集合
var backward_edges;//各点に入る枝集合
var paths;
var circles;

$(function(){
    var prob = "prob/"+document.location.search.substring(1)+".json";
    var field = $("#field")[0];
    var fwidth = $(field).innerWidth();
    var fheight = $(field).innerHeight();
    R = Raphael(field,fwidth,fheight);
    var lines = $("#lines")[0];
    var lwidth = $(lines).innerWidth();
    var lheight = $(lines).innerHeight();
    L = Raphael(lines,lwidth,lheight);
    load(prob);
});

function load(file){
    $.getJSON(file , function(data) {
        p=parseInt(data.p);
        vs=new Array();
        forward_edges=new Array();
        backward_edges=new Array();
        var i=0;
        $.each(data.V,function(){
            vs.push({
                x: this.x,
                y: this.y,
                reachable: false
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
    check();
    //draw edges
    paths = new Array();
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
            'arrow-end': 'block-midium-midium',
            //'arrow-start': 'oval-narrow-short'       
        });
        paths.push(e);
    }
    //draw vertices
    circles = new Array();
    for(var i=0;i<vs.length;++i){
        var v = R.circle(vs[i].x,vs[i].y,radius);
        v.attr("stroke","#000");
        v.id=i;
        if(i<=1){
            v.attr("fill","#f00");
        }
        else{
            v.attr("fill",vs[i].reachable?"#f00":"#ff0");
            v.attr("fill-opacity", 0.3);
            v.click(change);
            v.mouseover(function(){this.animate({"fill-opacity": 1.0}, 300);})
            v.mouseout(function(){this.animate({"fill-opacity": 0.3}, 300);});
        }
        circles.push(v);
    }

    R.text(vs[0].x,vs[0].y,"s").attr({"font": '18px Fontin-Sans, Arial', stroke: "none", fill: "#000"});
    R.text(vs[1].x,vs[1].y,"t").attr({"font": '18px Fontin-Sans, Arial', stroke: "none", fill: "#000"});

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


}
function redraw(){
    check();
    for(var i=0;i<es.length;++i){
        paths[i].attr("stroke",Raphael.hsb(1.0/p*es[i].label, 1, 0.8));
    }
    for(var i=0;i<vs.length;++i){
        if(i<=1){}
        else circles[i].attr("fill",vs[i].reachable?"#f00":"#ff0");
    }
}

function change(){
    console.log(this.id);
    var c = circles[this.id];
    c.animate({r: radius+5}, 200);
    setTimeout(function(){c.animate({r: radius}, 200);},200);

    for(var i=0;i<forward_edges[this.id].length;++i){
        es[forward_edges[this.id][i]].label=(es[forward_edges[this.id][i]].label+1)%p;
    }
    for(var i=0;i<backward_edges[this.id].length;++i){
        es[backward_edges[this.id][i]].label=(es[backward_edges[this.id][i]].label+p-1)%p;
    }
    redraw();
}
function check(){
    for(var i=0;i<vs.length;++i){
        vs[i].reachable=false;
    }
    var stack = new Array();
    stack.push(1);
    stack.push(0);
    $("#info").text("");
    while(stack.length>0){
        var v = stack.pop();
        if(vs[v].reachable)continue;
        if(v==1 && stack.length>0){
            $("#info").text("You win!");
        }
        vs[v].reachable=true;
        for(var j=0;j<forward_edges[v].length;++j){
            if(es[forward_edges[v][j]].label==0)stack.push(es[forward_edges[v][j]].head);            
        }
        for(var j=0;j<backward_edges[v].length;++j){
            if(es[backward_edges[v][j]].label==0)stack.push(es[backward_edges[v][j]].tail);
        }
    }
}
function reset(){
    for(var i=0;i<es.length;++i){
        es[i].label=es[i].initial_label;
    }
    redraw();
}
