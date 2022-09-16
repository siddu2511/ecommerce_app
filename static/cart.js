var removeCartItems = document.getElementsByClassName('danger-btn');
console.log(removeCartItems);
for(var i=0;i< removeCartItems.length; i++)
{
    var button = removeCartItems[i];
    button.addEventListener('click',function(event){
        var buttonClicked = event.target;
        buttonClicked.parentElement.remove();
    })
}