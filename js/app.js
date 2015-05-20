


$(document).ready(function(){
    
    // CAROUSELS
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

        obj.init = function(_carousel,_navigationItems){    	
            carousel = _carousel;            
            carouselWrapper = $(carousel).find('.carouselWrapper');
            
            if(_navigationItems.navigationDots) navigationDots = _navigationItems.navigationDots;
            if(_navigationItems.btnPrev) btnPrev = _navigationItems.btnPrev;
            if(_navigationItems.btnNext) btnNext = _navigationItems.btnNext;             

        	nrSlides = $(carousel).find('.carouselItem').length;        	
        	currentWidth = $(carousel).parent().width();
        	
            carousel.css('width',currentWidth);
        	carousel.css('overflow-x','hidden');
        	carouselWrapper.css('width',currentWidth * nrSlides);
        	carousel.find('.carouselItem').css('width',currentWidth);
        	carousel.eq(0).css('left','0');

            carouselWrapper.css('transform','translate(0,0)');        	
        	
            hammertime = new Hammer(document.getElementById('smoothCarousel'));

            if(_navigationItems.navigationDots) obj.buildDotNavigation();
            
            obj.addEvents();
            obj.setActiveNavigationItem();

    	}
    	

        obj.buildDotNavigation = function(){
            var dotNav = '';
            dotNav += '<ul>';
            for(var i = 0; i < nrSlides; i++){
                dotNav += '<li></li>';
            }
            dotNav += '</ul>';

            navigationDots.append(dotNav);

        }

        
        // ADD PANNING, TOUCH START, TOUCH END AND ANIMATION FRAME EVENTS


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
            // PREV NEXT NAVIGATION
            //

            btnPrev.on('click',function(){
                nextItem = (nextItem !== 0) ? nextItem - 1 : 0;
                obj.setDestinationX();
                obj.setActiveNavigationItem();                    
            });

            //
            // PREV NEXT NAVIGATION
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
                startPos = parseInt(carouselWrapper.css('translate').split(',')[0]);                                    
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
                isPanning = true;                
                var newPos = ((startPos + ev.deltaX) + 'px') + ',0';                                           
                carouselWrapper.css('translate',newPos);
                currentX = (startPos + ev.deltaX);
                velocityX = defaultVelocity - Math.abs((ev.velocityX/3));                                
            });

            //  REQUEST ANIMATION FRAME FOR SMOOTHNESS

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

            // EVENT TO ADJUST SIZE AND THRESHOLD ON RESIZE            

        	$(window).resize(function(){
            	resizeContainer();
        	});

        	
    	}

    	
        //
        // ANIMATE THE CAROUSEL WITH 
        //


        obj.animate = function(){
            
            // DONT'T DO ANYTHING WHILE WE'RE DRAGGING

            if(isPanning === true) return;
            
            // SIMLE EASING EQUATION (THANKS TO MISTER @ROBPENNER)
            // FIRST CALCULATE THE DIFFERENCE BETWEEN THE CURRENT AND WANTED POSTION
            
            distanceX = Number(destinationX) - Number(currentX);
            
            // INCREMENT THE POSITION WITH A RATIO BASED ON THE DIFFERENCE BETWEEN CURRENT AND WANTED POSITION
            
            translateX = (distanceX === 0) ? currentX : ((currentX + (distanceX/velocityX)));            
            translateXY = translateX + 'px , 0px';

            if(Math.abs(distanceX) < 1){
                  translateXY = destinationX + ',0';
            }

            // ACTUALLY POSITION THE IMAGE

             carouselWrapper.css('translate',translateXY);
            
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


    	function resizeContainer(){
            currentWidth = $(carousel).parent().width();
            carousel.find('.carouselWrapper').css('left',0-(nextItem * currentWidth));
        	carousel.css('width',currentWidth);
        	carousel.css('overflow-x','hidden');
        	carouselWrapper.css('width',currentWidth * nrSlides);
        	carousel.find('.carouselItem').css('width',currentWidth);
    	}


    	
        return obj;
    	
	})();
	
	
    ProjectCarousel.init($('#smoothCarousel'),{navigationDots : $('#carouselDotNavigation'), btnPrev : $('#prev'),btnNext : $('#next')});
		
    
    
    
    
})