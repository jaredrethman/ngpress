<?php
$parse_uri = explode( 'wp-content', $_SERVER['SCRIPT_FILENAME'] );
require_once( $parse_uri[0] . 'wp-load.php' );

$states = array(); 
$is_posts = false; $is_pages = false; 
$page404 = get_page_by_title( '404' );
$is_front = (int)get_option( 'page_on_front' );
$is_blog = (int)get_option( 'page_for_posts' );

$pages_args = array(
	'post_type' => array('page','post'),
	'posts_per_page' => -1,
	'post__not_in' => array($page404->ID)
);

$posts = get_posts($pages_args); $blog_name = '';
foreach($posts as $post){
	
	//Get Page Template
	$page_template = get_post_meta($post->ID, '_wp_page_template', true);	
	$page_template = $page_template !== 'default' ? $page_template : 'partials/page.tpl.php';

	//BLOG
	if($post->ID === $is_blog){
		$state = array(
			"name" 			=> $post->post_name,
			"url" 			=> '/' . $post->post_name,
			"post_type" 	=> $post->post_type,
			"controller" 	=> "BlogController",
			"templateUrl"	=> NGPRESS_THEME_URI . $page_template,
			"post_id" 		=> $post->ID
		);
		array_push(	$states, $state );
		$blog_name = $post->post_name;
	}
	//HOME/FRONT
	else if($post->ID === $is_front){
		$state = array(
			"name" 			=> $post->post_name,
			"url" 			=> '/',
			"post_type" 	=> $post->post_type,
			"controller" 	=> "HomeController",
			"templateUrl" 	=> NGPRESS_THEME_URI . $page_template,
			"post_id" 		=> $post->ID
		);
		array_push(	$states, $state );
	}
	//PAGES
	else if($post->post_type === 'page' && $post->ID !== $is_front && $post->ID !== $is_blog){
		$is_pages = true;
	}
	if($post->post_type === 'post'){
		$is_posts = true;		
	}
}

//POSTS
if($is_posts){
	$blog_name = $blog_name !== '' ? $blog_name : 'blog';
	$poststate = array(
		"name" 			=> 'post',
		"url" 			=> '/' . $blog_name . '/:slug',
		"post_type" 	=> 'post',
		"controller" 	=> "PostController",
		"templateUrl" 	=> NGPRESS_THEME_URI . 'partials/single-post.tpl.php'
	);
	array_push(	$states, $poststate );
}

//PAGES
if($is_pages){
	$state = array(
		"name" 			=> 'page',
		"url"			=> '/:slug',
		"post_type" 	=> 'page',
		"controller" 	=> "PageController",
		"templateUrl" 	=> NGPRESS_THEME_URI . $page_template
	);
	array_push(	$states, $state );
}

//404
if (isset($page404->ID)) {
	$poststate = array(
		"name" 			=> '404',
		"url" 			=> '/404',
		"controller"	=> "PagesController",
		"templateUrl" 	=> NGPRESS_THEME_URI . 'partials/404.tpl.php',
		"post_id" 		=> $page404->ID
	);
	array_push(	$states, $poststate );
}
header('Content-Type: application/json');
echo json_encode($states);