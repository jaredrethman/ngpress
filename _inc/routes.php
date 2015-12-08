<?php
//Custom routes / endpoints

function register_routes( $routes ) {

		register_rest_route( 'wp/v2', 'post_by_slug', array(
			'methods' => 'GET',
			'callback' => array( $this, 'get_post_by_slug' ),
			'args' => array(
				'slug' => array (
					'required' => false
				)
			)
		) );

	}

	function get_post_by_slug( WP_REST_Request $request ) {

		$slug = $request['slug'];
		$return['slug'] = $slug;

		$return['post'] = get_page_by_path( $slug, ARRAY_A, 'post' );

		$response = new WP_REST_Response( $return );
		return $response;

	}