import "@stdlib/deploy";

struct Player {
    address: Address;
    level: Int as uint64;
    expCaps: Int;
    currentProgress: Int;
}

message IncreaseExp{
    exp: Int;
    address: Address;
}

contract ExpRegistry with Deployable {
    // The Registry mapping that store all the user data
    registryMap: map<Address, Player>;

    // ERROR CODES
    const NOT_FOUND: Int = 15;

    // Init
    init(){
        self.registryMap = emptyMap();
    }

    // To register a user
    receive("register") {
        let sender: Address = sender();
        let newPlayer: Player = Player{
            address: sender,
            level: 1,
            expCaps: 100,
            currentProgress: 0,
        };
        self.registryMap.set(sender, newPlayer);
        self.notify("Registered".asComment());
    }
    
    receive(msg: IncreaseExp) {
        let currentPlayerNotSure: Player? = self.registryMap.get(msg.address);
        if(currentPlayerNotSure != null){
            let currentPlayer: Player = self.registryMap.get(msg.address)!!;
            let expCaps: Int = currentPlayer.expCaps;
            let currentProgress: Int = currentPlayer.currentProgress;
            let tempValue: Int = currentProgress + msg.exp;
            if(expCaps < tempValue){
                currentPlayer.level+=1;
                currentPlayer.expCaps+=100;
                currentPlayer.currentProgress = tempValue - expCaps;
                self.registryMap.set(msg.address, currentPlayer);
                self.notify("Exp Increased".asComment());
            }else{
                currentPlayer.currentProgress = tempValue;
                self.registryMap.set(msg.address, currentPlayer);
                self.notify("Exp Increased".asComment());
            }
        }else{
            dump(self.NOT_FOUND);
        }
    }
}   
