port module Ports exposing (imageProcessed, uploadFile)

import Brainloller.Lang exposing (BLProgram)


port uploadFile : String -> Cmd msg


port imageProcessed : (BLProgram -> msg) -> Sub msg
