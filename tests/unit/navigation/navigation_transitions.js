/*
 * mobile navigation unit tests
 */
(function($){
	var perspective = "viewport-flip",
			transitioning = "ui-mobile-viewport-transitioning",
			animationCompleteFn = $.fn.animationComplete,
			defaultMaxTrans = $.mobile.maxTransitionWidth,

			//TODO centralize class names?
			transitionTypes = "in out fade slide flip reverse pop",

			isTransitioning = function(page){
				return $.grep(transitionTypes.split(" "), function(className, i){
					return page.hasClass(className);
				}).length > 0;
			},

			isTransitioningIn = function(page){
				return page.hasClass("in") && isTransitioning(page);
			},
			
			disableMaxTransWidth = function(){
				$.mobile.maxTransitionWidth = false;
			},
			
			enableMaxTransWidth = function(){
				$.mobile.maxTransitionWidth = defaultMaxTrans;
			},

			//animationComplete callback queue
			fromQueue = [],
			toQueue = [],

			resetQueues = function(){
				fromQueue = [];
				toQueue = [];
			},
			
			onFromComplete = function( f ){
				fromQueue.push( f );
			},
			
			onToComplete = function( f ){
				toQueue.push( f );
			},
			

			//wipe all urls
			clearUrlHistory = function(){
				$.mobile.urlHistory.stack = [];
				$.mobile.urlHistory.activeIndex = 0;
			};


	module('jquery.mobile.navigation.js', {
		setup: function(){
			// disable this option so we can test transitions regardless of window width
			disableMaxTransWidth();
			
			//stub to allow callback before function is returned to transition handler
			$.fn.animationComplete = function( callback ){
				animationCompleteFn.call( this, function(){
					var queue = $(this).is(".out") ? fromQueue : toQueue;
					for( var i = 0, il = queue.length; i < il; i++ ){
						queue.pop()( this );
					}
					callback();
				});
				return this;
			};

			resetQueues();
			clearUrlHistory();
		},

		teardown: function(){
			// unmock animation complete
			$.fn.animationComplete = animationCompleteFn;
			enableMaxTransWidth();
		}
	});
	
	/* 
	NOTES: 
	Our default transition handler now has either one or two animationComplete calls - two if there are two pages in play (from and to) 
	To is required, so each async function must call start() onToComplete, not onFromComplete.
	*/
	

	asyncTest( "changePage applies perspective class to mobile viewport for flip", function(){
		expect(1);
		
		onToComplete( function( el ){
			ok($("body").hasClass(perspective), "has perspective class");
			start();
		} );
		
		$("#foo > a").click();

	});
	
	asyncTest( "changePage does not apply perspective class to mobile viewport for transitions other than flip", function(){
		expect(1);
		
		onToComplete( function( el ){
			ok(!$("body").hasClass(perspective), "doesn't have perspective class");
			start();
		} );
		
		$("#bar > a").click();
	});
	
	asyncTest( "changePage applies transition class to mobile viewport for default transition", function(){
		expect(1);
		
		onToComplete( function( el ){
			ok($("body").hasClass(transitioning), "has transitioning class");
			start();
		} );
		
		$("#baz > a").click();

	});
	
	asyncTest( "explicit transition preferred for page navigation reversal (ie back)", function(){
		expect( 1 );
		
		onToComplete(function(){
			$("#flip-trans > a").click();
			onToComplete(function(){
				$("#fade-trans > a").click();
				onToComplete(function(){
					ok($("#flip-trans").hasClass("fade"), "has fade class");
					start();
				});
			});
		});
		
		$("#fade-trans > a").click();
	});

	asyncTest( "default transition is fade", function(){
		onToComplete(function(){
			ok($("#no-trans").hasClass("fade"), "has fade class");
			start();
		})
		
		$("#default-trans > a").click();
	});

	asyncTest( "changePage queues requests", function(){
		expect(4)
		var firstPage = $("#foo"),
			secondPage = $("#bar");

		$.mobile.changePage(firstPage);
		$.mobile.changePage(secondPage);

		onToComplete(function(){
			ok(isTransitioningIn(firstPage), "first page begins transition");
			ok(!isTransitioningIn(secondPage), "second page doesn't transition yet");
			onToComplete(function(){
				ok(!isTransitioningIn(firstPage), "first page transition should be complete");
				ok(isTransitioningIn(secondPage), "second page should begin transitioning");
				start();
				
			});
		});
	});

	asyncTest( "default transition is pop for a dialog", function(){
		expect( 1 );
		onToComplete(function(){
			ok($("#no-trans-dialog").hasClass("pop"), "has pop class" );
			start();
		});
		
		$("#default-trans-dialog > a").click();
	});

	test( "animationComplete return value", function(){
		$.fn.animationComplete = animationCompleteFn;
		equals($("#foo").animationComplete(function(){})[0], $("#foo")[0]);
	});

})(jQuery);
