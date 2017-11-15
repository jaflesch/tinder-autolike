// parameters
var sleep = 250;

// main block
var run = setInterval(function(){
    var span = document.getElementsByTagName("span");
    
    for(var i =0; i< span.length; i++) {
    	// if reached max likes per day then show modal and get it's content...
        if(span[i].textContent != "Acabaram suas curtidas") {
			
			// Like button element
            document.getElementsByClassName("recsGamepad__button--like")[0].click();
       }
       else {
            clearInterval(run);
       }
    }
}, sleep);