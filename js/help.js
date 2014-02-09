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

    mode=(document.location.hash.substring(1)!="undirected");
    console.log(mode?"directed mode":"undirected mode");
    step=0;
    load(prob);
});

