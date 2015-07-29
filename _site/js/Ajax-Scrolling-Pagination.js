/*
 * NoGray JavaScript Library
 *
 * Copyright (c), All right reserved
 * Gazing Design - http://www.NoGray.com
 * Free to use as long as the copyrights
 * notice is not removed. For customization
 * or installation service, please contact
 * us at http://www.nogray.com/contact.php
 */
 
(function($){
    //return;
    $(function(){
        var thumb_height_func = false;
        // if your template uses a function to set the thumbnails height,
        // uncomment the line below and make sure to use the correct function name
        // var thumb_height_func = setProductListHeights;
        
        // general settings about the template
        var max_auto_load = 10;
        
        // div id that holds the comparison form and products
        var parent_div = '#CategoryContent';
        
        // element tag that holds the products
        var products_parent_tag = 'ul';
        var products_tag = 'li';
        
        // prefix for each css class page (e.g. page-#) where # is the page number
        var css_prefix = '.page-';
        
        // paging div class name
        var paging_class_name = '.CategoryPagination';
        
        // paging list element tags
        var paging_ul = 'ul';
        var paging_li = 'li';
        
        // endless loading div class
        var paging_class = '.endless-paging';
        var load_more_class = '.endless-load-more';
        var loading_class = '.endless-loading';
        var load_more_text = 'load more';
        
        // show page numbers next to each new set
        var show_page_numbers = true;
        
        // quickview button object
        var quickbutton = {
            buttonText: "Quick View",
            buttonColor: "#f7f7f7",
            gradientColor: "#dcdbdb",
            textColor: "#000000"
        };
        
        // DO NOT change anything below this unless you know what you are doing
        
        // page number class name
        var page_number_class = '.page-number';
        var outof_pages_class = '.outof-pages';
        var page_number_prefix = 'Page ';
        var outof_number_prefix = ' of ';
        
        // scripts variables
        var pages_arr = [];
        var current_page = 1;
        var num_loads = 1;
        var processing_ajax = false;
        
        var clsnm = function(nm){
            return nm.replace('.', '');
        };
        
        var total_pages = function(){
            if (pages_arr.length) return pages_arr.length - 1;
            else return 1;
        };
        
        var get_page = function (num){
            // check if we need to refetch data
            if (num < 1) return;
            if (pages_arr[num] == null) return;
            if (processing_ajax) return;
            if ($(css_prefix+num).length) return;
            // ajax get the page content
            processing_ajax = true;
            $.get(pages_arr[num], function(data){
                processing_ajax = false;
                var data = process_data(data);
                insert_page(data, num);
            });
        };
        
        // processing the HTML document
        var process_data = function(html){
            // removing the loading animation
            $(paging_class).removeClass(clsnm(loading_class));
            // holding the html for paging
            var pging = html;
            
            // getting the page url to see if we have new pages
            var pos = pging.indexOf(clsnm(paging_class_name));
            if (pos != -1){
                // getting the paging ul
                pos = pging.indexOf('<'+paging_ul, pos);
                // if no content, return
                if (pos != -1) {
                    // finding the closing tag
                    pging = pging.substr(pos);
                    var closing_tag = '</'+paging_ul+'>';
                    
                    pos = pging.indexOf(closing_tag);
                    pging = pging.substr(0, pos+closing_tag.length);
                    
                    // creating the hidden div to hold the paging
                    var dv = document.createElement('div');
                    dv.innerHTML = pging;
                    
                    process_paging(dv.getElementsByTagName(paging_ul)[0], false);
                }
            }
            
            // holding the html products
            var p_html = html;
            // getting the products list from the html
            var id = clsnm(parent_div.replace('#', ''));
            var pos = p_html.indexOf(id);
            
            // if no content, return
            if (pos == -1) return null;
            
            // finding the list of products
            pos = p_html.indexOf('<'+products_parent_tag, pos);
            
            // if no content, return
            if (pos == -1) return null;
            
            // finding the closing tag
            p_html = p_html.substr(pos);
            var closing_tag = '</'+products_parent_tag+'>';
            
            pos = p_html.indexOf(closing_tag);
            p_html = p_html.substr(0, pos+closing_tag.length);
            
            // creating the hidden div and applying the changes to it
            var dv = document.createElement('div');
            dv.innerHTML = p_html;
            return dv.getElementsByTagName(products_parent_tag)[0];
        };
        
        var insert_page = function(elm, num){
            // setting the number of pages loaded
            num_loads++;
            
            process_ul(elm, num);
            
            var added = false;
            if (num == 1) $(paging_class).first().remove();
            if (num == total_pages()) $(paging_class).last().remove();
            
            $(parent_div+' '+products_parent_tag).each(function(k, ul){
                var pgnum = parseInt($(ul).data('page-number'), 8);
                if (pgnum > num){
                    $(ul).before(elm);
                    var h = $(elm).outerHeight(true);
                    scroll_to(h, true);
                    added = true;
                    return false;
                }
                else if (pgnum == num - 1){
                    $(ul).after(elm);
                    added = true;
                    return false;
                }
            });
            
            if (!added) $(parent_div+' '+products_parent_tag).last().after(elm);
            if (show_page_numbers){
                var dv = $('<div class="'+clsnm(page_number_class)+'" data-page-number="'+num+'">'+page_number_prefix+num+'<span class="'+clsnm(outof_pages_class)+'">'+outof_number_prefix+(total_pages())+'</span></div>');
                $(elm).prepend(dv);
            }
            
            if (thumb_height_func){
                setTimeout(thumb_height_func, 100); 
            }
        };
        
        // adding the class name and data to the ul
        // plus clearing the bottom to get the correct height
        var process_ul = function(elm, num){
            var cls_nm = clsnm(css_prefix);
            $(elm).addClass(cls_nm+num).data('page-number', num);
            $(elm).append('<'+products_tag+' style="height:1px !important; float:none !important; clear:both !important; overflow:hidden !important; min-height:0px !important; margin:0px !important; padding:0px !important; border:none !important; visiblity:hidden !important;">&nbsp;</'+products_tag+'>');
            
            // check if the quickview function is defined.
            if ($(".QuickView", elm).quickview){
                $(".QuickView", elm).quickview(quickbutton);
            }

        };
        
        // process the paging list to get the links
        var process_paging = function(elm, cur){
            $(paging_li, elm).each(function(k, elm) {
                var arr = elm.getElementsByTagName('a');
                if (arr.length){
                    var pg_num = parseInt($(arr[0]).text(), 8);
                    if (!isNaN(pg_num)){
                        pages_arr[pg_num] = (arr[0].href);
                    }
                }
                else {
                    if (cur) {
                        current_page = parseInt($(elm).text(), 8);
                    }
                }
            });
            
            $(outof_pages_class).html(outof_number_prefix+(total_pages()));
        };
        
        // adding the loading divs
        var add_loading_div = function(elm, dir){
            var dv = $('<div class="'+clsnm(paging_class)+'"><div class="'+clsnm(load_more_class)+'">'+load_more_text+'</div></div>');
            if (dir == 'before'){
                dv.click(function(evt){
                    var pg = $(parent_div+' '+products_parent_tag).first().data('page-number');
                    pg = parseInt(pg);
                    if (isNaN(pg)) return;
                    get_page(pg - 1);
                    $(this).addClass(clsnm(loading_class));
                });
            }
            else {
                dv.click(function(evt){
                    var pg = $(parent_div+' '+products_parent_tag).last().data('page-number');
                    pg = parseInt(pg);
                    if (isNaN(pg)) return;
                    get_page(pg + 1);
                    $(this).addClass(clsnm(loading_class));
                });
            }
            $(elm).parent().after(dv);
        }
        
        // function to scroll the document when adding pages above current page
        var scroll_to = function(tp, add){
            if (add) tp += $(window).scrollTop();
            $(window).scrollTop(tp);
        };
        
        // getting the page links
        process_paging($(paging_class_name).first(), true);
        
        if (show_page_numbers){
            var dv = $('<div class="'+clsnm(page_number_class)+'" data-page-number="'+current_page+'">'+page_number_prefix+current_page+'<span class="'+clsnm(outof_pages_class)+'">'+outof_number_prefix+(total_pages())+'</span></div>');
            $(parent_div+' '+products_parent_tag).first().prepend(dv);
        }
        
        // adding the "Load more" div
        if (current_page != 1) add_loading_div($(paging_class_name).first(), 'before');
        add_loading_div($(paging_class_name).last(), 'after');
        
        $(paging_class_name).parent().remove();
        
        // setting the current ul details
        process_ul($(parent_div+' '+products_parent_tag).first(), current_page);
        // getting the page before and after the current page
        /*if (current_page > 1){
            get_page(current_page - 1);
        }
        
        get_page(current_page + 1);*/
        
        // timeout to check if scroll ends
        var scroll_timeout = 0;
        $(window).scroll(function(evt){
            //return;
            if (num_loads > max_auto_load) return;
            clearTimeout(scroll_timeout);
            scroll_timeout = setTimeout(process_scroll, 10);
        });
        
        var process_scroll = function(){
            var pgdiv_ln = $(paging_class).length;
            if (pgdiv_ln == 0) return;
            
            var st = $(window).scrollTop();
            var h = $(window).height(); 
            var ldt = $(paging_class).first().position().top;
            if ((ldt > st - h) && (ldt < st + h)) {
                $(paging_class).first().click();
            }
            
            if (pgdiv_ln > 1){
                var ldt = $(paging_class).last().position().top;
                if ((ldt > st) && (ldt < st + h)) {
                    $(paging_class).last().click();
                }
            }
        };
    });
})(jQuery);

