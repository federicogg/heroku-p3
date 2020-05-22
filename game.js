class Game {

    constructor()
    {
        this.state = 'PREPARING';
        this.players = [];
        this.num_jugador = 0;
        this.territories = [];
        this.msg = '';
        this.turn = 0;
        this.addTerritories();
        
    }

    

    addTerritories()
    {
        this.territories.push(new Territory('islas-canarias'));
        this.territories.push(new Territory('andalucia'));
        this.territories.push(new Territory('extremadura'));
        this.territories.push(new Territory('castilla-la-mancha'));
        this.territories.push(new Territory('murcia'));
        this.territories.push(new Territory('valencia'));
        this.territories.push(new Territory('islas-baleares'));
        this.territories.push(new Territory('catalonia'));
        this.territories.push(new Territory('aragon'));
        this.territories.push(new Territory('navarra'));
        this.territories.push(new Territory('la-rioja'));
        this.territories.push(new Territory('pais-vasco'));
        this.territories.push(new Territory('castilla-leon'));
        this.territories.push(new Territory('madrid'));
        this.territories.push(new Territory('cantabria'));
        this.territories.push(new Territory('asturias'));
        this.territories.push(new Territory('galicia'));
    }


    addPlayer(user)
    {

        if (this.num_jugador < 4)
        {
            var add = true;
            var i=0;
            while (i<this.players.length && add)
            {
                if (this.players[i].equal(user))
                    add = false;
                i++
            }
    
            if (add)
            {
                var player = new Player (user, this.num_jugador);
                this.players.push(player);
                this.num_jugador++;
            }
        }
        else
            var add = false;
        
        return add;
    }

    primero()
    {
        return this.players.length == 1;
    }

    getPlayers()
    {
        return this.players;
    }

    getTerritories()
    {
        return this.territories;
    }

    startGame()
    {
        this.state = 'PLAYING';
        this.user_turn = this.players[0].user;
        this.assignRandomTerritories();
        this.msg = 'La partida ha comenzado, el turno es de ' + this.user_turn;
        this.msg += '<br>Las opciones para atacar de ' + this.user_turn + ' son: </br>';
        this.msg += this.players[0].adjacents;
    }


    getPlayer (user)
    {
        var terminado = false;
        var i=0;
        while (!terminado && i < this.players.length)
        {
            if (this.players[i].equal(user))
            {
                var result = this.players [i];
                terminado = true;
            }
            i++;
        }

        return result;
    }

    
    assignRandomTerritories()
    {
        var numbers = [];
        for (var i=0; i<this.territories.length; i++)
            numbers.push(i);

        var randoms = this.shuffle(numbers);

        for (var i = 0; i<this.players.length; i++)
        {
            this.players[i].comunities.push(this.territories[randoms[i]].comunity);
            this.setAdjacents(i);
            this.territories[randoms[i]].setPlayer(this.players[i]);
        }
        
    }

    setAdjacents(num_j)
    {
        var adjacents = [];

        for (var i=0; i<this.territories.length; i++)
        {
            var territory = this.territories[i];

            for (var j=0; j<this.players[num_j].comunities.length; j++)
            {
                var comunity = this.players[num_j].comunities[j];

                if (comunity === territory.comunity)
                {
                    console.log ('Adyacentes 0 ' + territory.adjacents.toString());
                    for (var z=0; z<territory.adjacents.length; z++)
                        adjacents.push(territory.adjacents[z]);
                }
            }
        }

        adjacents = this.deleteOwnComunities(adjacents,this.players[num_j].comunities);
        adjacents = this.deleteDuplicatedTerritories(adjacents);
        this.players[num_j].setAdjacents(adjacents);
    }

    deleteOwnComunities(adjacents,comunities)
    {
        for (var i=0; i<adjacents.length; i++)
        {
            for (var j=0; j<comunities.length; j++)
            {
                if (adjacents[i] == comunities[j])
                {
                    adjacents.splice(i,1);
                }
            }
        }

        
        return adjacents;
    }

    deleteDuplicatedTerritories (territories)
    {
        return  territories.filter((a, b) => territories.indexOf(a) === b);
    }

    exitsAdjacent (user, comunity)
    {

        var player = this.getPlayer(user);
        var i=0;
        var terminado = false;
        while (!terminado && i< player.adjacents.length)
        {

            if (player.adjacents[i] == comunity)
                terminado = true;
            
            i++
        }


        return terminado;
    }

    attack (user, comunity)
    {
        var territory = this.getTerritory(comunity);
        var player = this.getPlayer(user);
        this.players[player.num_jugador].defending = false;

        if (territory.player.user == 'NO_ONE')
        {

            this.addComunity(comunity,user);
            this.msg = user + ' ha ganado porque no había nadie';
        }
        else
        {
            var dado1 = this.getRndInteger(1,6);
            var dado2 = this.getRndInteger(1,6);
            this.msg = user + ' sacó un ' + dado1 + ' , '  + territory.player.user + ' sacó un ' + dado2;

            if (dado1 >= dado2)
            {
                this.deleteComunity(territory.player.user);
                this.addComunity(comunity,user);
                this.msg += '<br>'+ user + ' ha ganado ' + comunity + '</br>';
                
            }
            else if (territory.player.defending && dado1 < dado2)
            {
                this.msg += '<br>'+ territory.player.user + ' ha ganado eliminando a su adversario una comunidad aleatoria </br>';
                this.deleteRandomComunity(user); 
            }
            else
            {
                this.msg += '<br>'+ user + ' NO ha ganado ' + comunity + '</br>';
            }
        }
    }

    defend(user)
    {
        var player = this.getPlayer(user);
        this.players[player.num_jugador].defending = true;
        this.msg = user + ' ha optado por defenderse';
    }

    isTurn(user)
    {
        return this.user_turn == user;
    }

    deleteRandomComunity(user)
    {
        var player = this.getPlayer(user);
        var max = this.players[player.num_jugador].comunities.length-1;
        var random = this.getRndInteger(0, max);
        this.deleteComunity(this.players[player.num_jugador].comunities[random]);
    }

    getTerritory(comunity)
    {
        var i=0;
        var terminado = false;

        while (!terminado && i<this.territories.length)
        {
            if (this.territories[i].comunity == comunity)
            {
                var territory = this.territories[i];
                terminado = true;
            }

            i++;
        }

        return territory;
    }

    nextTurn()
    {
        this.turn++;
        this.turn = this.turn % this.players.length;
        this.user_turn = this.players[this.turn].user;
        this.setAdjacents(this.turn);
        this.msg += '<br>Le toca a ' + this.user_turn + '. Sus opciones para atacar son:</br>';
        this.msg += '<br>' + this.players[this.turn].adjacents + '.</br>';

    }

    deleteComunity(comunity, user)
    {
        var i=0;
        var terminado = false;
        while (!terminado && i<this.players.length)
        {
            if(this.players[i].user === user)
            {
                var j=0;
                var terminado2 = false;
                while (!terminado2 && j < this.players.comunities.length)
                {
                    if (this.players.comunities[j] == comunity)
                    {
                        this.players.comunities.splice(j,1);
                        this.setAdjacents(i);
                        terminado2 = true;
                    }

                    j++;
                }

                terminado = true;
            }

            i++;
        }
        var player = new Player('NO_ONE', -1);
        player.setColor('grey');
        this.changeTerritoryPlayer(comunity,player);

    }

    changeTerritoryPlayer(comunity, player)
    {
        var terminado = false;
        var i = 0;
        while (!terminado && i < this.territories.length)
        {
            if (this.territories[i].comunity == comunity)
            {
                this.territories[i].player = player;
                terminado = true;
            }

            i++;
        }
    }

    addComunity(comunity, user)
    {
        var i=0;
        var terminado = false;
        while (!terminado && i<this.players.length)
        {
            if(this.players[i].user === user)
            {
                this.players[i].comunities.push(comunity);
                this.setAdjacents(i);
                terminado = true;
            } 

            i++;
        }

        var player = this.getPlayer(user);

        this.changeTerritoryPlayer(comunity,player);
    }

    

    shuffle(o) {
        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }


    

}

class Player{

    constructor(user, num_jugador)
    {
        this.user = user;
        this.state = 'READY';
        this.num_jugador = num_jugador;
        this.comunities = [];
        this.adjacents = [];
        this.defending = false;
        if (user != 'NO_ONE')
            this.asignarColor();
    }

    asignarColor()
    {
        var colors = ['red', 'lime', 'gold', 'blueviolet'];
        this.color = colors[this.num_jugador];
    }

    setColor (color)
    {
        this.color = color;
    }

    setAdjacents (adjacents)
    {
        this.adjacents = adjacents;

        

        console.log ('Adyacentes 3 ' + this.adjacents.toString());
    }

    

    
    equal (user)
    {
        return this.user == user;
    }
}

class Territory{

    constructor(comunity)
    {
        this.comunity = comunity;
        this.player = new Player ('NO_ONE',-1);
        this.player.setColor('grey');
        this.adjacents = [];
        this.setAdjacents();
    }

    setPlayer(player)
    {
        this.player = player;
    }


    setAdjacents()
    {
        if (this.comunity == 'andalucia')
            this.adjacents = ['extremadura','castilla-la-mancha','murcia'];

        else if (this.comunity == 'islas-canarias')
            this.adjacents = ['andalucia'];
        
        else if (this.comunity == 'extremadura')
            this.adjacents = ['andalucia', 'castilla-la-mancha','castilla-leon'];

        else if (this.comunity == 'castilla-la-mancha')
            this.adjacents = ['extremadura','andalucia','madrid','castilla-leon','murcia','valencia','aragon'];
            
        else if(this.comunity == 'murcia')
            this.adjacents = ['andalucia','valencia','castilla-la-mancha'];
        
        else if (this.comunity == 'valencia')
            this.adjacents = ['castilla-la-mancha','murcia','aragon','catalonia','islas-baleares'];
        
        else if (this.comunity == 'islas-baleares')
            this.adjacents = ['valencia','catalonia'];

        else if (this.comunity == 'catalonia')
            this.adjacents = ['valencia','aragon','islas-baleares'];

        else if (this.comunity == 'aragon')
            this.adjacents = ['catalonia', 'valencia','navarra','la-rioja','castilla-la-mancha','castilla-leon'];

        else if (this.comunity == 'navarra')
            this.adjacents = ['pais-vasco','la-rioja','aragon'];

        else if (this.comunity == 'la-rioja')
            this.adjacents = ['navarra','aragon','pais-vasco','castilla-leon'];

        else if (this.comunity == 'castilla-leon')
            this.adjacents = ['extremadura','castilla-la-mancha','madrid','aragon', 'la-rioja','pais-vasco','cantabria','asturias','galicia'];
        
        else if (this.comunity == 'pais-vasco')
            this.adjacents = ['cantabria','castilla-leon','la-rioja','navarra'];
        
        else if (this.comunity == 'cantabria')
            this.adjacents = ['pais-vasco','castilla-leon','asturias'];

        else if (this.comunity == 'asturias')
            this.adjacents = ['cantabria','castilla-leon','galicia'];

        else if (this.comunity == 'galicia')
            this.adjacents = ['asturias','castilla-leon'];
        
        else if (this.comunity == 'madrid')
            this.adjacents = ['castilla-la-mancha','castilla-leon'];
        

    }

    equal(territorio)
    {
        return this.comunity == territorio.comunity;
    }
}

module.exports = Game
