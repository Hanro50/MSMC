# Lexipacks!
These are optional files that provide translations for msmc events and errors. They are meant to be used by launcher developers to easily change the language msmc displays errors and load events in. 

If a languagepack is missing a translation, the internal translation function msmc will map it to the next available lexicode. A lexicode is essentially a string that uses a "." to seperate between the key words held within a set code. 

# Contribution 
Besides just checking for trolling via a basic google translation check. You are free to create pull requests to add more lexipacks. These won't be included by default, but can be downloaded by launcher developers seperately to add multilingual support.  

A version header is added simply to check when a set lexipack was last updated. This is here simply for launcher developers to see at a glance if they need to update their bundled lexipacks. The version string should match the version of msmc the pack was last updated against. 

# Maintainers 
The people you need to bug about translation errors in a set lexipack. This will be updated as more lexipacks are added.
* Afrikaans [Hanro50](https://github.com/hanro50)
* English [Hanro50](https://github.com/hanro50)
* French [Txab](https://github.com/Txab33), [ri1_](https://github.com/ri1ongithub)
* German [Matix-Media](https://github.com/Matix-Media)
* Turkish [Kuzey Kurtuluş](https://github.com/kuzeeeyk)
* Italian [kz-n](https://github.com/kz-n)

# Note
The internal code of msmc should still be english. Mainly due to the maintainment nightmare it would be if we had 500 different languages represented in the code itself. This merely effects the output of msmc and you may be asked to switch to the default english lexipack when opening a support ticket in MCJS café. 
