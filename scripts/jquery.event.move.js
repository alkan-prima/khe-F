(function(module){if(typeof define==='function'&&define.amd){define(['jquery'],module);}else{module(jQuery);}})(function(jQuery,undefined){var
threshold=6,add=jQuery.event.add,remove=jQuery.event.remove,trigger=function(node,type,data){jQuery.event.trigger(type,data,node);},requestFrame=(function(){return(window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(fn,element){return window.setTimeout(function(){fn();},25);});})(),ignoreTags={textarea:true,input:true,select:true,button:true},mouseevents={move:'mousemove',cancel:'mouseup dragstart',end:'mouseup'},touchevents={move:'touchmove',cancel:'touchend',end:'touchend'};function Timer(fn){var callback=fn,active=false,running=false;function trigger(time){if(active){callback();requestFrame(trigger);running=true;active=false;}
else{running=false;}}
this.kick=function(fn){active=true;if(!running){trigger();}};this.end=function(fn){var cb=callback;if(!fn){return;}
if(!running){fn();}
else{callback=active?function(){cb();fn();}:fn;active=true;}};}
function returnTrue(){return true;}
function returnFalse(){return false;}
function preventDefault(e){e.preventDefault();}
function preventIgnoreTags(e){if(ignoreTags[e.target.tagName.toLowerCase()]){return;}
e.preventDefault();}
function isLeftButton(e){return(e.which===1&&!e.ctrlKey&&!e.altKey);}
function identifiedTouch(touchList,id){var i,l;if(touchList.identifiedTouch){return touchList.identifiedTouch(id);}
i=-1;l=touchList.length;while(++i<l){if(touchList[i].identifier===id){return touchList[i];}}}
function changedTouch(e,event){var touch=identifiedTouch(e.changedTouches,event.identifier);if(!touch){return;}
if(touch.pageX===event.pageX&&touch.pageY===event.pageY){return;}
return touch;}
function mousedown(e){var data;if(!isLeftButton(e)){return;}
data={target:e.target,startX:e.pageX,startY:e.pageY,timeStamp:e.timeStamp};add(document,mouseevents.move,mousemove,data);add(document,mouseevents.cancel,mouseend,data);}
function mousemove(e){var data=e.data;checkThreshold(e,data,e,removeMouse);}
function mouseend(e){removeMouse();}
function removeMouse(){remove(document,mouseevents.move,mousemove);remove(document,mouseevents.cancel,mouseend);}
function touchstart(e){var touch,template;if(ignoreTags[e.target.tagName.toLowerCase()]){return;}
touch=e.changedTouches[0];template={target:touch.target,startX:touch.pageX,startY:touch.pageY,timeStamp:e.timeStamp,identifier:touch.identifier};add(document,touchevents.move+'.'+ touch.identifier,touchmove,template);add(document,touchevents.cancel+'.'+ touch.identifier,touchend,template);}
function touchmove(e){var data=e.data,touch=changedTouch(e,data);if(!touch){return;}
checkThreshold(e,data,touch,removeTouch);}
function touchend(e){var template=e.data,touch=identifiedTouch(e.changedTouches,template.identifier);if(!touch){return;}
removeTouch(template.identifier);}
function removeTouch(identifier){remove(document,'.'+ identifier,touchmove);remove(document,'.'+ identifier,touchend);}
function checkThreshold(e,template,touch,fn){var distX=touch.pageX- template.startX,distY=touch.pageY- template.startY;if((distX*distX)+(distY*distY)<(threshold*threshold)){return;}
triggerStart(e,template,touch,distX,distY,fn);}
function handled(){this._handled=returnTrue;return false;}
function flagAsHandled(e){e._handled();}
function triggerStart(e,template,touch,distX,distY,fn){var node=template.target,touches,time;touches=e.targetTouches;time=e.timeStamp- template.timeStamp;template.type='movestart';template.distX=distX;template.distY=distY;template.deltaX=distX;template.deltaY=distY;template.pageX=touch.pageX;template.pageY=touch.pageY;template.velocityX=distX/time;template.velocityY=distY/time;template.targetTouches=touches;template.finger=touches?touches.length:1;template._handled=handled;template._preventTouchmoveDefault=function(){e.preventDefault();};trigger(template.target,template);fn(template.identifier);}
function activeMousemove(e){var timer=e.data.timer;e.data.touch=e;e.data.timeStamp=e.timeStamp;timer.kick();}
function activeMouseend(e){var event=e.data.event,timer=e.data.timer;removeActiveMouse();endEvent(event,timer,function(){setTimeout(function(){remove(event.target,'click',returnFalse);},0);});}
function removeActiveMouse(event){remove(document,mouseevents.move,activeMousemove);remove(document,mouseevents.end,activeMouseend);}
function activeTouchmove(e){var event=e.data.event,timer=e.data.timer,touch=changedTouch(e,event);if(!touch){return;}
e.preventDefault();event.targetTouches=e.targetTouches;e.data.touch=touch;e.data.timeStamp=e.timeStamp;timer.kick();}
function activeTouchend(e){var event=e.data.event,timer=e.data.timer,touch=identifiedTouch(e.changedTouches,event.identifier);if(!touch){return;}
removeActiveTouch(event);endEvent(event,timer);}
function removeActiveTouch(event){remove(document,'.'+ event.identifier,activeTouchmove);remove(document,'.'+ event.identifier,activeTouchend);}
function updateEvent(event,touch,timeStamp,timer){var time=timeStamp- event.timeStamp;event.type='move';event.distX=touch.pageX- event.startX;event.distY=touch.pageY- event.startY;event.deltaX=touch.pageX- event.pageX;event.deltaY=touch.pageY- event.pageY;event.velocityX=0.3*event.velocityX+ 0.7*event.deltaX/time;event.velocityY=0.3*event.velocityY+ 0.7*event.deltaY/time;event.pageX=touch.pageX;event.pageY=touch.pageY;}
function endEvent(event,timer,fn){timer.end(function(){event.type='moveend';trigger(event.target,event);return fn&&fn();});}
function setup(data,namespaces,eventHandle){add(this,'movestart.move',flagAsHandled);return true;}
function teardown(namespaces){remove(this,'dragstart drag',preventDefault);remove(this,'mousedown touchstart',preventIgnoreTags);remove(this,'movestart',flagAsHandled);return true;}
function addMethod(handleObj){if(handleObj.namespace==="move"||handleObj.namespace==="moveend"){return;}
add(this,'dragstart.'+ handleObj.guid+' drag.'+ handleObj.guid,preventDefault,undefined,handleObj.selector);add(this,'mousedown.'+ handleObj.guid,preventIgnoreTags,undefined,handleObj.selector);}
function removeMethod(handleObj){if(handleObj.namespace==="move"||handleObj.namespace==="moveend"){return;}
remove(this,'dragstart.'+ handleObj.guid+' drag.'+ handleObj.guid);remove(this,'mousedown.'+ handleObj.guid);}
jQuery.event.special.movestart={setup:setup,teardown:teardown,add:addMethod,remove:removeMethod,_default:function(e){var event,data;if(!e._handled()){return;}
function update(time){updateEvent(event,data.touch,data.timeStamp);trigger(e.target,event);}
event={target:e.target,startX:e.startX,startY:e.startY,pageX:e.pageX,pageY:e.pageY,distX:e.distX,distY:e.distY,deltaX:e.deltaX,deltaY:e.deltaY,velocityX:e.velocityX,velocityY:e.velocityY,timeStamp:e.timeStamp,identifier:e.identifier,targetTouches:e.targetTouches,finger:e.finger};data={event:event,timer:new Timer(update),touch:undefined,timeStamp:undefined};if(e.identifier===undefined){add(e.target,'click',returnFalse);add(document,mouseevents.move,activeMousemove,data);add(document,mouseevents.end,activeMouseend,data);}
else{e._preventTouchmoveDefault();add(document,touchevents.move+'.'+ e.identifier,activeTouchmove,data);add(document,touchevents.end+'.'+ e.identifier,activeTouchend,data);}}};jQuery.event.special.move={setup:function(){add(this,'movestart.move',jQuery.noop);},teardown:function(){remove(this,'movestart.move',jQuery.noop);}};jQuery.event.special.moveend={setup:function(){add(this,'movestart.moveend',jQuery.noop);},teardown:function(){remove(this,'movestart.moveend',jQuery.noop);}};add(document,'mousedown.move',mousedown);add(document,'touchstart.move',touchstart);if(typeof Array.prototype.indexOf==='function'){(function(jQuery,undefined){var props=["changedTouches","targetTouches"],l=props.length;while(l--){if(jQuery.event.props.indexOf(props[l])===-1){jQuery.event.props.push(props[l]);}}})(jQuery);};});