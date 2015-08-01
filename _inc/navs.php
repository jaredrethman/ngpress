<?php

//Simple Walker class to enable UI Router routing in wp_nav_menu
class ngpress_walker_nav_menu extends Walker_Nav_Menu {
  
	// add classes to ul sub-menus
	function start_lvl( &$output, $depth = 0, $args = array() ) {
		
		$indent = ( $depth > 0  ? str_repeat( "\t", $depth ) : '' );
		$display_depth = ( $depth + 1); 
		$classes = array(
			'sub-menu',
			( $display_depth % 2  ? 'menu-odd' : 'menu-even' ),
			( $display_depth >=2 ? 'sub-sub-menu' : '' ),
			'sub-menu'
			);
		$class_names = implode( ' ', $classes );
	  
		// build html
		$output .= "\n" . $indent . '<ul class="' . $class_names . '">' . "\n";
	}
  
	// add main/sub classes to li's and links
 	function start_el(  &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
		global $wp_query;
		
		$is_front = (int)get_option( 'page_on_front' );
		$post_obj = get_post($item->object_id); 
		$slug = $post_obj->post_name;
		//$slug = $slug !== 'home'
		$item_title = $item->title;
		
		$indent = ( $depth > 0 ? str_repeat( "\t", $depth ) : '' ); // code indent
	  
		$output .= $indent . '<li>';
	   
		if(	!empty( $slug ) ){
			if($is_front === $post_obj->ID) {
				//Is Home page
		   		$attributes  = ' data-ui-sref="home"';
			}else{
				$attributes  = ' data-ui-sref="page({ slug:\'' . esc_attr( $slug ) . '\' })"';
			}
		   $attributes .= ' data-ui-sref-active="active"';
		}
	   
		$item_output = sprintf( '%1$s<a%2$s>%3$s%4$s%5$s</a>%6$s',
		$args->before,
		$attributes,
		$args->link_before,
		apply_filters( 'the_title', $item->title, $item->ID ),
		$args->link_after,
		$args->after
		);
	  
		// build html
		$output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
	}
}