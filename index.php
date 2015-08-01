<?php get_header(); ?>
	<div class="col-lg-12">
        <?php locate_template( array('templates/page-header.php'), true ); ?>
		<div>
			<article>
				<div ui-view></div>
			</article>
		</div>

	</div>
<?php get_footer(); ?>