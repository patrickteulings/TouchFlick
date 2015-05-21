
// ----------------------------------------------------
//  TouchFlick: 
//  A responsive gallery with smooth 
//  scrolling, swiping
//  Uses css transforms for positioning
//  
//  Requires: 
//  
//  MODERNIZR 
//  For csstransform sniffing
//  http://modernizr.com/
//
//  HAMMER.JS 
//  For touch events
//  http://hammerjs.github.io/
//
//  JQUERY 
//  For Dom Manipulation (may alter in future versions)

// ----------------------------------------------------


$(document).ready(function(){
    
    
    ProjectCarousel = (function(_carousel,_navigation){
        var obj = {};
    	
    	var currentWidth = 0;
    	var currentItem = 0;    	
    	var nextItem = 0;    	
    	var carousel;         

        var hammertime;
        var startPos = 0;
        var navigationDots;
        var carouselWrapper;
        var isPanning = false;
        var velocityX = 9;
        var defaultVelocity = 9;
        
        // NEW

        var destinationX = 0;
        var currentX = 0;
        var btnPrev;
        var btnNext;
        var nrSlides;
        var css3dTransforms = false;

        var transformPrefix;

        obj.init = function(_carousel,_navigationItems){    	
            carousel = _carousel;            
            carouselWrapper = $(carousel).find('.carouselWrapper');
            transformPrefix = obj.getCssPrefix().css + 'transform';

            // ADDING NAV ITEMS
            if(_navigationItems.navigationDots) navigationDots = _navigationItems.navigationDots;
            if(_navigationItems.btnPrev) btnPrev = _navigationItems.btnPrev;
            if(_navigationItems.btnNext) btnNext = _navigationItems.btnNext;             

            // LETS SEE WHICH TYPE OF TRNASFORM WE'LL USE
            css3dTransforms = $('html').hasClass('csstransforms3d');

            // CALCULLATE THE NUMBER OF SLIDES AND SET THEIR WIDTH
        	nrSlides = $(carousel).find('.carouselItem').length;        	
        	currentWidth = $(carousel).parent().width();
        	
            // INIT SOME CSS PROPERTIES
            carousel.css('width',currentWidth);
        	carousel.css('overflow-x','hidden');
        	carouselWrapper.css('width',currentWidth * nrSlides);
        	carousel.find('.carouselItem').css('width',currentWidth);
        	carousel.eq(0).css('left','0');

            // INITIATE THE CSS3 HARDWARE ACCELLERATION 
            carouselWrapper.css(transformPrefix,'translate3d(0px,0px,0px)');        	
        	
            // IT'S HAMMERTIME!
            hammertime = new Hammer(document.getElementById('smoothCarousel'));

            // BUILD OUR NAVIGATIONDOTS IF WE WANT THEM            
            if(_navigationItems.navigationDots) obj.buildDotNavigation();
            
            // ADD OUR EVENTS
            obj.addEvents();
            
            // INIT THE NAVIGATIONCONTROLS (eg ACTIVE / INACTIVE)
            obj.setActiveNavigationItem();

    	}
    	

        //
        // BUILDS AN UL LIST OF DOTS FOR QUICK NAVIGATION
        //


        obj.buildDotNavigation = function(){
            
            var dotNav = '<ul>';
            
            for(var i = 0; i < nrSlides; i++){
                dotNav += '<li></li>';
            }
            
            dotNav += '</ul>';

            navigationDots.append(dotNav);

        }


        //
        // ADD PANNING, TOUCH START, TOUCH END AND ANIMATION FRAME EVENTS
        //


    	obj.addEvents = function(){
        	
            //
            // DOT NAVIGATION
            //

            navigationDots.find('li').click(function(){
            	nextItem = $(this).index();
            	obj.setDestinationX();
                obj.setActiveNavigationItem();
            });

            //
            // PREV NEXT NAVIGATION: PREV
            //

            btnPrev.on('click',function(){
                nextItem = (nextItem !== 0) ? nextItem - 1 : 0;
                obj.setDestinationX();
                obj.setActiveNavigationItem();                    
            });

            //
            // PREV NEXT NAVIGATION: NEXT
            //

            btnNext.on('click',function(){                
                nextItem = (nextItem !== (nrSlides-1)) ? nextItem+ 1 : nextItem;
                obj.setDestinationX();
                obj.setActiveNavigationItem();                    
            });            

            //
            // ON TOUCH START - GET CAROUSEL-ORIGINAL-X 
            //

            hammertime.on("panstart", function(ev) {
                
                isPanning = true;
                var matrix = carouselWrapper.css(transformPrefix);                
                console.log('matrix: ' + matrix);
                startPos = Number(matrix.split('(')[1].split(')')[0].split(',')[4]);
                
                //startPos = parseInt(carouselWrapper.css('translate').split(',')[0]);                                    
            });

            //
            // ON TOUCH END - SCROLL TO NEXT ITEM IF THRESHOLD AND/OR SPEED ARE LARGE ENOUGH
            // 

            hammertime.on("panend", function(ev) {
                
                isPanning = false;

                // THRESHOLD AND/OR SPEED TOO LOW
                
                if(Math.abs(ev.deltaX) <  (currentWidth/4)){                    
                    return false;    
                }
                
                 // SCROLL RIGHT   
                
                if(ev.deltaX < 0 && nextItem < (nrSlides-1)){
                    nextItem += 1;
                }

                // SCROLL LEFT

                else if(ev.deltaX > 0 && nextItem > 0){
                    nextItem -= 1;
                }
                
                // UPDATE NAVIGATION ITEMS

                obj.setActiveNavigationItem();

                // SET THE DESTINATION VALUE WE WANT TO SCROLL TO
                
                obj.setDestinationX();                

            });


            //
            // ON TOUCH MOVE - POSITIONING WHILE MOUSEMOVE
            //


            hammertime.on("pan", function(ev) {
                
                // DON'T ANIMATE WHEN PANNING
                isPanning = true;                
                
                // CALCULATE THE NEW X-POSITION AND APPLY
                var newPos = ((Number(startPos) + ev.deltaX) + 'px') + ',0px ,0px';                                           
                
                // APPLY NEW POSITION WHEN PANNING               
                carouselWrapper.css(transformPrefix,'translate3d(' + newPos + ')');
                
                // STORE THE NEW POSITION
                currentX = (startPos + ev.deltaX);
                
                // KEEP TRACK OF THE DRAG VELOCITY, SO WE CAN DELIVER A NICER SWIPE EXPERIENCE
                velocityX = defaultVelocity - Math.abs((ev.velocityX/3));                                
            });


            //
            //  REQUEST ANIMATION FRAME FOR SMOOTHNESS
            //


            window.requestAnimFrame = (function(){
                return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                function( callback ){
                    window.setTimeout(callback, 1000 / 60);
                };
            })();


            (function animloop(){
                requestAnimFrame(animloop);
                obj.animate();
            })();


            //
            // WINDOW RESIZE EVENT TO ADJUST SIZE            
            //


        	$(window).resize(function(){
            	obj.resizeContainer();
        	});

        	
    	}

    	
        //
        // ANIMATE THE CAROUSEL WITH REQUESTANIMATIONFRAME FOR SMOOTHNESS
        //


        obj.animate = function(){
            
            // DONT'T DO ANYTHING WHILE WE'RE DRAGGING

            if(isPanning === true) return;
            
            // SIMLE EASING EQUATION (THANKS TO MISTER @ROBPENNER)
            // FIRST CALCULATE THE DIFFERENCE BETWEEN THE CURRENT AND WANTED POSTION
            
            distanceX = Number(destinationX) - Number(currentX);
            
            // INCREMENT THE POSITION WITH A RATIO BASED ON THE DIFFERENCE BETWEEN CURRENT AND WANTED POSITION
            
            translateX = (distanceX === 0) ? currentX : ((currentX + (distanceX/velocityX)));            
            translateXYZ = translateX + 'px , 0px,0px';

            

            if(Math.abs(distanceX) < 1){
                translateXYZ = destinationX + 'px,0px,0px';
            }

            // ACTUALLY POSITION THE IMAGE
            
            carouselWrapper.css(transformPrefix,'translate3d(' + translateXYZ + ')');            
            
            // RESET THE VARIABLES TO REFLECT CURRENT IMAGE POSITION

            currentX = translateX;
            
        };


    	//
        // ADD CSS CLASSES TO OUR NAVIGATIONITEMS
        //


        obj.setActiveNavigationItem = function(){

            // NAVIGATIONDOTS

            navigationDots.find('li').removeClass('active');
            navigationDots.find('li').eq(nextItem).addClass('active');
        
            // PREV BUTTON

            if(nextItem === 0){
                btnPrev.addClass('inactive');
            }else{
                if(btnPrev.hasClass('inactive')){
                    btnPrev.removeClass('inactive');    
                }                
            }
            
            // NEXT BUTTON

            if(nextItem === (nrSlides - 1)){
                btnNext.addClass('inactive');
            }else{
                if(btnNext.hasClass('inactive')){
                    btnNext.removeClass('inactive');    
                }                
            }            
        };



        obj.setDestinationX = function(){
            destinationX = 0 - (nextItem * currentWidth);
        }


        //
        //  CALCULATE THE NEW WIDTH
        //


        obj.getCssPrefix = function(){
            
            var styles = window.getComputedStyle(document.documentElement, ''),
            pre = (Array.prototype.slice
                .call(styles)
                .join('') 
                .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
                )[1],
                dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
            return {
                dom: dom,
                lowercase: pre,
                css: '-' + pre + '-',
                js: pre[0].toUpperCase() + pre.substr(1)
            };
        };


    	obj.resizeContainer = function(){
            currentWidth = $(carousel).parent().width();            
        	carousel.css('width',currentWidth);        	
        	carouselWrapper.css('width',currentWidth * nrSlides);
        	carousel.find('.carouselItem').css('width',currentWidth);
            
            destinationX = 0 - (nextItem * currentWidth);
        };


    	
        return obj;
    	
	})();
	
	
    ProjectCarousel.init($('#smoothCarousel'),{navigationDots : $('#carouselDotNavigation'), btnPrev : $('#prev'),btnNext : $('#next')});
		
    
    
    
    
})