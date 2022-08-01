<div class="drawer drawer-mobile">
	<input id="my-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<slot name="page content" />
	</div>
	<div class="drawer-side">
		<label for="my-drawer" class="drawer-overlay" />
		<slot name="drawer content" />
	</div>
</div>
