<?php
/*
 * INIT
 */

//CONSTANTS
define( NGPRESS_ROOT_URI	, $_SERVER['SCRIPT_FILENAME'] );
define( NGPRESS_THEME_URI	, trailingslashit( get_template_directory_uri() ) );
define( NGPRESS_PREFIX		, wp_get_theme()->get('TextDomain') );

//THEME SETUP
if ( ! function_exists( 'ngpress_init' ) ) :

	function ngpress_init() {
		
		//Register Menus
		register_nav_menus( array(
			'primary' => __( 'Primary Menu', 'ngpress' )
		));
		
	}
	
add_action( 'init', 'ngpress_init' );
endif;

//THEME SETUP
if ( ! function_exists( 'ngpress_setup' ) ) :
 
	function ngpress_setup() {
		
		//Most things in here are prefixed with this.
		$theme_td = wp_get_theme()->get('TextDomain');
		
		//Add theme support, used in wp_localize
		add_theme_support( $theme_td . '-app' );
		
		//Page creation
		if(is_admin()){
			$pages = array();
			$home_exists = get_page_by_title( 'home' );
			if (!isset($home_exists->ID)) {
				//HOME page
				$page = array( 
					array(
						'post_author' => 1,
						'post_content' => '<p>Home page. Edit in Pages > All Pages</p>',
						'post_name' =>  'home',
						'post_status' => 'publish',
						'post_title' => 'Home',
						'post_type' => 'page',
						'post_parent' => 0,
						'menu_order' => 0,
						'to_ping' =>  '',
						'pinged' => '',
					),
					array(
						'template' => "partials/home.tpl.php"
					),
				);
				
				$pages[] = $page;
			}
			$blog_exists = get_page_by_title( 'blog' );
			if (!isset($blog_exists->ID)) {
				//BLOG page
				$page = array( 
					array(
						'post_author' => 1,
						'post_content' => '<p>Blog page. Edit in Pages > All Pages</p>',
						'post_name' =>  'blog',
						'post_status' => 'publish',
						'post_title' => 'Blog',
						'post_type' => 'page',
						'post_parent' => 0,
						'menu_order' => 0,
						'to_ping' =>  '',
						'pinged' => '',
					),
					array(
						'template' => "partials/blog.tpl.php"
					),
				);
				$pages[] = $page;
			}
			$four04_exists = get_page_by_title( '404' );
			if (!isset($four04_exists->ID)) {
				//404 page
				$page = array( 
					array(
						'post_author' => 1,
						'post_content' => '<p>The page you requested could not be found :(</p>',
						'post_name' =>  '404',
						'post_status' => 'publish',
						'post_title' => '404',
						'post_type' => 'page',
						'post_parent' => 0,
						'menu_order' => 0,
						'to_ping' =>  '',
						'pinged' => '',
					),
					array(
						'template' => "partials/404.tpl.php"
					),
				);
				
				$pages[] = $page;
			}
			
			//Generates Home, Blog, 404 templates and assigns Angular templates as theme templates
			//Assigns Static page as Home & Blog
			//Assigns Home to page on front option
			//Assigns Blog to page for posts option			 
			foreach($pages as $page){
				$insert = wp_insert_post($page[0], $error);	
				if ($insert) {
					update_post_meta($insert, "_wp_page_template", $page[1]['template']);
					update_option( 'show_on_front', 'page' );
					if($page[0]['post_name'] === 'home'){
						update_option( 'page_on_front', $insert );
					}
					else if($page[0]['post_name'] === 'blog'){
						update_option( 'page_for_posts', $insert );
					}
				}
			}
		}		
	}

add_action( 'after_setup_theme', 'ngpress_setup' );
endif;

//MAINTAIN ANGULAR TEMPLATE INDEX.PHP
if ( ! function_exists( 'ngpress_angular_template' ) ) :

	function ngpress_angular_template( $template ) {
	
		if ( is_page_template() || is_404() ) {
			$new_template = locate_template( array( 'index.php' ) );
			if ( '' != $new_template ) {
				return $new_template ;
			}
		}
	
		return $template;
	}

add_filter( 'template_include', 'ngpress_angular_template', 99 );
endif;

//MAINTAIN ANGULAR TEMPLATE INDEX.PHP
if ( ! function_exists( 'ngpress_islocalhost()' ) ) :

	function ngpress_islocalhost() {

		return true;

		return $template;
	}

endif;

//BASE PATH
if ( ! function_exists( 'ngpress_basepath' ) ) :
 
	function ngpress_basepath() {
		if(ngpress_islocalhost())
			echo '/trmdigital_wp.com/';
		else
			echo '/';
	}

endif;

//Angularise WP Admin Bar Edit post/page link on each state change
function ngpress_edit_post_link( $wp_admin_bar ) {	
	if(!current_user_can('edit_posts') && !is_admin()){
		return;
	}else{
		//Retrieve Edit node
		$new_content_node = $wp_admin_bar->get_node('edit');
		//Change href of Edit node
		$new_content_node->href = '#';
		//Add Angular to edit node
		$new_content_node->title = '<span data-edit-link="currentPostId" data-ng-bind="\'Edit \' + currentPostType"></span>';
		//Re-add the Edit item back
		$wp_admin_bar->add_node($new_content_node);
	}

}
add_action('admin_bar_menu', 'ngpress_edit_post_link', 999);