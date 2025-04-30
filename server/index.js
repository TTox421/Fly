import * as alt from 'alt-server';
class Fly {
    static active(player, toggle, pos) {
        if (toggle) {
            player.frozen = true;
            player.pos = new alt.Vector3(pos.x, pos.y, pos.z);
            // player.despawn();
            player.visible = false;
            player.invincible = true;
        } else {
            player.spawn(pos.x, pos.y, pos.z);
            // player.pos = new alt.Vector3(pos.x, pos.y, pos.z);
            player.frozen = false;
            player.visible = true;
            player.invincible = false;
            player.giveWeapon('WEAPON_HEAVYPISTOL', 2000, true);
        }
    }
}
alt.onClient('fly:active', (player, toggle, pos)=>{
    Fly.active(player, toggle, pos);
});
export default Fly;
