<?php
/*
	Template name: Home
*/

header('Content-Type: text/html');

?>

<div data-the-content="vm.content"></div>

<data-post-list
    data-posts-per-page="10"
    data-post-type="posts"
>
    <data-post
        data-ng-repeat="post in posts"
    >
        <a data-ui-sref="post({slug:post.slug})">
            <h1 data-ng-bind="post.title"></h1>
        </a>
        <div data-ng-bind-html="post.excerpt"></div>
    </data-post>
</data-postlist>