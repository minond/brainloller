port module Ports exposing (downloadProgram, imageProcessed, uploadProgram)

import Brainloller.Lang exposing (BLProgram)


port downloadProgram : BLProgram -> Cmd msg


port uploadProgram : String -> Cmd msg


port imageProcessed : (BLProgram -> msg) -> Sub msg
