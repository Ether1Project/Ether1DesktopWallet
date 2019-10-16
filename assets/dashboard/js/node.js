'use strict'
const IPFS = require('ipfs');
const Protector = require('libp2p-pnet');

process.env.LIBP2P_FORCE_PNET = 1
window.node = null;
window.info = null;

const swarmKey = "/key/swarm/psk/1.0.0/\n/base16/\n38307a74b2176d0054ffa2864e31ee22d0fc6c3266dd856f6d41bddf14e2ad63";
var swarmKeyBuffer = Buffer.from(swarmKey);

/* ===========================================================================
   Start the IPFS node
   =========================================================================== */
function start() {
    console.log("Starting ethoFS Node...");
    if (!node) {
        console.log("Setting Up ethoFS Node Options...");
        const options = {
            libp2p: {
                modules: {
                    connProtector: new Protector(swarmKeyBuffer)
                },
		config: {
		    dht: {
		        enabled: false
		    }
		}
	    },
            config: {
	            Bootstrap: [
                        '/dns4/wss0.ethofs.com/tcp/443/wss/ipfs/QmTJ81wQ6cQV9bh5nTthfLbjnrZPMeeCPfvRFiygSzWV1W',
                        '/dns4/wss1.ethofs.com/tcp/443/wss/ipfs/QmTcwcKqKcnt84wCecShm1zdz1KagfVtqopg1xKLiwVJst',
                        '/dns4/wss.ethofs.com/tcp/443/wss/ipfs/QmPW8zExrEeno85Us3H1bk68rBo7N7WEhdpU9pC9wjQxgu',
                        '/dns4/wss2.ethofs.com/tcp/443/wss/ipfs/QmUEy4ScCYCgP6GRfVgrLDqXfLXnUUh4eKaS1fDgaCoGQJ',
                        '/dns4/wss3.ethofs.com/tcp/443/wss/ipfs/QmPT4bDvbAjwPTjf2yeugRT1pruHoH2DMLhpjR2NoczWgw',
                        '/dns4/wss4.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ',
                        '/dns4/wss5.ethofs.com/tcp/443/wss/ipfs/QmRwQ49Zknc2dQbywrhT8ArMDS9JdmnEyGGy4mZ1wDkgaX',
                        '/dns4/wss6.ethofs.com/tcp/443/wss/ipfs/Qmf4oLLYAhkXv95ucVvUihnWPR66Knqzt9ee3CU6UoJKVu',
                        '/dns4/wss0.ethofs.com/tcp/443/wss/ipfs/QmTJ81wQ6cQV9bh5nTthfLbjnrZPMeeCPfvRFiygSzWV1W',
                        '/dns4/wss7.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ',
                        '/dns4/wss8.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ'
                    ],
		Addresses: {
                    Swarm: [
                        '/dns4/wss0.ethofs.com/tcp/443/wss/ipfs/QmTJ81wQ6cQV9bh5nTthfLbjnrZPMeeCPfvRFiygSzWV1W',
                        '/dns4/wss1.ethofs.com/tcp/443/wss/ipfs/QmTcwcKqKcnt84wCecShm1zdz1KagfVtqopg1xKLiwVJst',
                        '/dns4/wss.ethofs.com/tcp/443/wss/ipfs/QmPW8zExrEeno85Us3H1bk68rBo7N7WEhdpU9pC9wjQxgu',
                        '/dns4/wss2.ethofs.com/tcp/443/wss/ipfs/QmUEy4ScCYCgP6GRfVgrLDqXfLXnUUh4eKaS1fDgaCoGQJ',
                        '/dns4/wss3.ethofs.com/tcp/443/wss/ipfs/QmPT4bDvbAjwPTjf2yeugRT1pruHoH2DMLhpjR2NoczWgw',
                        '/dns4/wss4.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ',
                        '/dns4/wss5.ethofs.com/tcp/443/wss/ipfs/QmRwQ49Zknc2dQbywrhT8ArMDS9JdmnEyGGy4mZ1wDkgaX',
                        '/dns4/wss6.ethofs.com/tcp/443/wss/ipfs/Qmf4oLLYAhkXv95ucVvUihnWPR66Knqzt9ee3CU6UoJKVu',
                        '/dns4/wss0.ethofs.com/tcp/443/wss/ipfs/QmTJ81wQ6cQV9bh5nTthfLbjnrZPMeeCPfvRFiygSzWV1W',
                        '/dns4/wss7.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ',
                        '/dns4/wss8.ethofs.com/tcp/443/wss/ipfs/QmeG81bELkgLBZFYZc53ioxtvRS8iNVzPqxUBKSuah2rcQ'
                     ]
                }
            }
        }
        console.log("Launching ethoFS Node...");
        window.node = new IPFS(options)
        console.log("Waiting For ethoFS Node Launch Confirmation...");
        window.node.once('start', () => {
            console.log("ethoFS Node Startup Confirmed...");    
                window.node.id()
                .then((id) => {
                    
                    window.info = id
                    console.log("Getting ethoFS Node ID...");
                    EthoUploads.subscribeToHealthChannel()
                    EthoUploads.updateView('ready', window.node)
                    EthoUploads.onSuccess('Node is ready.')
                    setInterval(EthoUploads.refreshPeerList, 10000)
                })
                .catch((error) => EthoUploads.onError(error))
        })
    }
}
window.startNode = function() {
    start()
}